// Puts every registered web build into static/builds/<slug>/<version>/: downloaded once
// into .cache/, checked against the pinned SHA-256, provenance verified, unzipped. A folder
// per version, so a cached page never mixes two releases. Other versions' folders are
// removed locally; the bucket keeps them (see `deploy:upload`).
//
//   node scripts/fetch-builds.ts [slug...]

import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { webAsset } from '../src/lib/registry.ts';
import {
	ROOT,
	assertPlainTree,
	checkZip,
	download,
	loadGames,
	run,
	sha256,
	verifyProvenance
} from './lib.ts';

const only = new Set(process.argv.slice(2));
const games = loadGames().filter((g) => g.web && (only.size === 0 || only.has(g.slug)));

for (const game of games) {
	const web = game.web!;
	const version = game.release.version;
	const asset = webAsset(game)!;
	const stamp = `${version} ${web.sha256}`;
	const base = join(ROOT, 'static', 'builds', game.slug);
	const dest = join(base, version);
	const entry = web.entry ?? 'index.html';

	const marker = join(dest, 'VERSION');
	if (
		existsSync(join(dest, entry)) &&
		existsSync(marker) &&
		readFileSync(marker, 'utf8').trim() === stamp
	) {
		console.log(`${game.slug} ${version}: up to date`);
		continue;
	}

	console.log(`${game.slug} ${version}: fetching ${asset}`);
	const cache = join(ROOT, '.cache', game.slug, version);
	const zip = join(cache, asset);
	mkdirSync(cache, { recursive: true });
	if (!existsSync(zip) || sha256(zip) !== web.sha256) {
		await download(`https://github.com/${game.repo}/releases/download/${version}/${asset}`, zip);
	}
	const actual = sha256(zip);
	if (actual !== web.sha256) {
		throw new Error(`${game.slug}: ${asset} has SHA-256 ${actual}, registry pins ${web.sha256}`);
	}
	if (web.attest !== false) verifyProvenance(zip, game.repo);
	checkZip(zip, entry);

	for (const v of existsSync(base) ? readdirSync(base) : [])
		rmSync(join(base, v), { recursive: true });
	mkdirSync(dest, { recursive: true });
	run('unzip', ['-q', '-o', zip, '-x', '.trunk-lock', '-d', dest]);
	assertPlainTree(dest);
	if (!statSync(join(dest, entry), { throwIfNoEntry: false })?.isFile()) {
		throw new Error(`${game.slug}: ${entry} missing after unpacking ${asset}`);
	}
	writeFileSync(join(dest, 'VERSION'), `${stamp}\n`);
}
