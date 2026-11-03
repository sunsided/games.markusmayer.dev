// Node-side helpers for the scripts: reading the registry from disk, hashing, running
// tools. Run with plain `node` (Node 26 strips the types), so imports carry .ts.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
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
