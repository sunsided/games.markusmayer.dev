// Node-side helpers for the scripts: reading the registry from disk, hashing, running
// tools. Run with plain `node` (Node 26 strips the types), so imports carry .ts.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validate, type Game } from '../src/lib/registry.ts';

export const ROOT = join(import.meta.dirname, '..');
export const GAMES_DIR = join(ROOT, 'games');

export function gameFile(slug: string) {
	return join(GAMES_DIR, `${slug}.json`);
}

/** Every registry entry, validated; fails on the first bad file. */
export function loadGames(): Game[] {
	return readdirSync(GAMES_DIR)
		.filter((f) => f.endsWith('.json') && f !== 'schema.json')
		.map((f) => {
			const game = validate(JSON.parse(readFileSync(join(GAMES_DIR, f), 'utf8')), `games/${f}`);
			if (`${game.slug}.json` !== f) throw new Error(`games/${f}: slug "${game.slug}" ≠ file name`);
			return game;
		});
}

export function sha256(file: string) {
	return createHash('sha256').update(readFileSync(file)).digest('hex');
}

export function run(cmd: string, args: string[], opts: { quiet?: boolean } = {}) {
	return execFileSync(cmd, args, { stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8' });
}

export function hasGhAuth() {
	try {
		execFileSync('gh', ['auth', 'status'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Checks GitHub build provenance for a file from `repo`. In CI a missing `gh` login is an
 * error; locally the check is skipped with a note (the SHA-256 is still checked).
 */
export function verifyProvenance(file: string, repo: string) {
	if (!hasGhAuth()) {
		if (process.env.CI)
			throw new Error('gh is not logged in: CI must verify provenance (set GH_TOKEN)');
		console.warn(`  note: gh not logged in, provenance of ${file} not verified (SHA-256 was)`);
		return;
	}
	run('gh', ['attestation', 'verify', file, '--repo', repo], { quiet: true });
	console.log(`  provenance verified: ${file}`);
}

/**
 * Refuses a web zip whose contents could escape or leak once unpacked and published:
 * symlinks or other non-regular entries (a link to a runner file would be uploaded to
 * the public bucket), absolute paths, `..` segments, backslashes. Also requires `entry`
 * at the root. Returns the entry names.
 */
export function checkZip(zip: string, entry: string): string[] {
	const names = run('zipinfo', ['-1', zip], { quiet: true }).split('\n').filter(Boolean);
	// Long listing, same order as -1: the first column is the Unix mode, `l` for a link.
	const modes = run('zipinfo', [zip], { quiet: true })
		.split('\n')
		.filter((l) => /^[-a-z?]{10}\s/.test(l))
		.map((l) => l[0]);
	if (modes.length !== names.length) {
		throw new Error(`${zip}: could not read every entry's type (${modes.length}/${names.length})`);
	}
	const bad = names.filter(
		(name, i) =>
			(modes[i] !== '-' && modes[i] !== 'd') ||
			name.startsWith('/') ||
			name.includes('\\') ||
			name.split('/').includes('..')
	);
	if (bad.length) throw new Error(`${zip}: refusing unsafe entries: ${bad.join(', ')}`);
	if (!names.includes(entry)) throw new Error(`${zip}: no ${entry} at its root`);
	return names;
}

/** After unpacking: nothing but regular files and directories, as checkZip promised. */
export function assertPlainTree(dir: string) {
	for (const name of readdirSync(dir, { recursive: true }) as string[]) {
		const stat = lstatSync(join(dir, name));
		if (!stat.isFile() && !stat.isDirectory()) {
			throw new Error(`${dir}: ${name} is not a regular file or directory`);
		}
	}
}

export async function download(url: string, dest: string) {
	const { writeFile } = await import('node:fs/promises');
	const res = await fetch(url, { redirect: 'follow' });
	if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
	await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

export async function githubApi<T>(path: string): Promise<T> {
	const headers: Record<string, string> = {
		accept: 'application/vnd.github+json',
		'x-github-api-version': '2022-11-28',
		'user-agent': 'games.markusmayer.dev-sync'
	};
	if (process.env.GH_TOKEN) headers.authorization = `Bearer ${process.env.GH_TOKEN}`;
	const res = await fetch(`https://api.github.com/${path}`, { headers });
	if (!res.ok) throw new Error(`GitHub API ${path}: ${res.status} ${await res.text()}`);
	return (await res.json()) as T;
}
