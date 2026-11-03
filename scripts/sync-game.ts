// Moves a registered game to a new release: the step a game repository's release ping
// (repository_dispatch `game-released`, see .github/workflows/game-released.yml) runs.
//
//   node scripts/sync-game.ts --repo sunsided/cheesed --tag v0.1.3 [--force]
//
// Only repositories already in games/*.json are accepted: the registry is the allowlist,
// and onboarding a game is a hand-written games/<slug>.json. The release must be published
// (not a draft or prerelease), and for a web game its zip must match the line in the
// release's SHA256SUMS and carry a build-provenance attestation from that repository,
// and hold only regular files and folders (no symlinks, no paths leaving the folder; see
// checkZip).
// Older tags than the one pinned are refused unless --force.
//
// Writes slug, version and changed to $GITHUB_OUTPUT when set.

import { appendFileSync, mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
	REPO,
	VERSION,
	compareVersions,
	coverSource,
	fill,
	validate
} from '../src/lib/registry.ts';
import {
	checkImage,
	checkZip,
	download,
	gameFile,
	githubApi,
	loadGames,
	sha256,
	verifyProvenance
} from './lib.ts';

interface GhRelease {
	tag_name: string;
	html_url: string;
	draft: boolean;
	prerelease: boolean;
	published_at: string;
	assets: { name: string; browser_download_url: string }[];
}

const { values } = parseArgs({
	options: {
		repo: { type: 'string' },
		tag: { type: 'string' },
		force: { type: 'boolean', default: false }
	}
});
const repo = values.repo ?? '';
const tag = values.tag ?? '';
if (!REPO.test(repo)) throw new Error(`--repo: "${repo}" is not owner/name`);
if (!VERSION.test(tag)) throw new Error(`--tag: "${tag}" is not a version tag`);

const game = loadGames().find((g) => g.repo.toLowerCase() === repo.toLowerCase());
if (!game) {
	throw new Error(`${repo} is not registered. Add games/<slug>.json by hand first (see README).`);
}

const output = (pairs: Record<string, string>) => {
	if (!process.env.GITHUB_OUTPUT) return;
	for (const [k, v] of Object.entries(pairs))
		appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
};

const cmp = compareVersions(tag, game.release.version);
if (cmp === 0) {
	console.log(`${game.slug} is already at ${tag}; nothing to do.`);
	output({ slug: game.slug, version: tag, changed: 'false' });
	process.exit(0);
}
if (cmp < 0 && !values.force) {
	throw new Error(
		`${game.slug}: ${tag} is older than pinned ${game.release.version} (use --force)`
	);
}

const release = await githubApi<GhRelease>(
	`repos/${game.repo}/releases/tags/${encodeURIComponent(tag)}`
);
if (release.draft || release.prerelease) {
	throw new Error(
		`${game.repo} ${tag} is a ${release.draft ? 'draft' : 'prerelease'}; not publishing it`
	);
}

const next = structuredClone(game);
next.release = { version: tag, date: release.published_at, url: release.html_url };

if (game.web) {
	const name = fill(game.web.asset, tag);
	const asset = release.assets.find((a) => a.name === name);
	const sums = release.assets.find((a) => a.name === 'SHA256SUMS');
	if (!asset) throw new Error(`${game.repo} ${tag} has no asset ${name}`);
	if (!sums) throw new Error(`${game.repo} ${tag} has no SHA256SUMS`);

	const dir = mkdtempSync(join(tmpdir(), `sync-${game.slug}-`));
	await download(sums.browser_download_url, join(dir, 'SHA256SUMS'));
	const line = readFileSync(join(dir, 'SHA256SUMS'), 'utf8')
		.split('\n')
		.map((l) => l.trim().split(/\s+\*?/))
		.find(([, file]) => file === name);
	if (!line) throw new Error(`SHA256SUMS of ${tag} lists no ${name}`);
	const pinned = line[0].toLowerCase();

	const zip = join(dir, name);
	await download(asset.browser_download_url, zip);
	const actual = sha256(zip);
	if (actual !== pinned) throw new Error(`${name}: SHA-256 ${actual} ≠ SHA256SUMS ${pinned}`);
	if (game.web.attest !== false) verifyProvenance(zip, game.repo);

	checkZip(zip, game.web.entry ?? 'index.html');

	next.web = { ...game.web, sha256: pinned };
}

// The title art at the new tag. A cover that moved or went away fails the sync rather than
// silently dropping the card: fix `cover.path` (or remove `cover`) and run it again.
if (game.cover) {
	const dir = mkdtempSync(join(tmpdir(), `cover-${game.slug}-`));
	const file = join(dir, 'cover');
	try {
		await download(coverSource(game.repo, tag, game.cover.path), file);
	} catch (e) {
		throw new Error(`${game.repo} ${tag} has no ${game.cover.path} (cover.path): ${e}`);
	}
	checkImage(file, game.cover.path);
	next.cover = { ...game.cover, sha256: sha256(file) };
}

validate(next, `games/${game.slug}.json (updated)`);
writeFileSync(gameFile(game.slug), `${JSON.stringify(next, null, '\t')}\n`);
console.log(`${game.slug}: ${game.release.version} → ${tag}`);
output({ slug: game.slug, repo: game.repo, version: tag, changed: 'true' });
