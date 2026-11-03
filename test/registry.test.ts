import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { compareVersions, fill } from '../src/lib/registry.ts';
import { loadGames } from '../scripts/lib.ts';

test('every registry entry validates and matches its file name', () => {
	const games = loadGames();
	assert.ok(games.length > 0);
	assert.equal(
		new Set(games.map((g) => g.repo.toLowerCase())).size,
		games.length,
		'one entry per repo'
	);
});

test('compareVersions orders tags', () => {
	assert.ok(compareVersions('v0.1.10', 'v0.1.9') > 0);
	assert.ok(compareVersions('v1.0.0', 'v1.0.0-rc.1') > 0);
	assert.ok(compareVersions('v1.0.0-rc.2', 'v1.0.0-rc.10') < 0);
	assert.equal(compareVersions('1.2.3', 'v1.2.3'), 0);
});

test('fill replaces every {version}', () => {
	assert.equal(fill('x-{version}/y-{version}', 'v1.0.0'), 'x-v1.0.0/y-v1.0.0');
});

test('checkZip refuses symlinks and accepts a plain build', async () => {
	const { execFileSync } = await import('node:child_process');
	const { mkdtempSync, symlinkSync, writeFileSync } = await import('node:fs');
	const { tmpdir } = await import('node:os');
	const { join } = await import('node:path');
	const { checkZip } = await import('../scripts/lib.ts');
	const dir = mkdtempSync(join(tmpdir(), 'zip-'));
	writeFileSync(join(dir, 'index.html'), '<!doctype html>');
	symlinkSync('/etc/passwd', join(dir, 'leak'));
	execFileSync('zip', ['-q', '-y', 'ok.zip', 'index.html'], { cwd: dir });
	execFileSync('zip', ['-q', '-y', 'bad.zip', 'index.html', 'leak'], { cwd: dir });
	assert.deepEqual(checkZip(join(dir, 'ok.zip'), 'index.html'), ['index.html']);
	assert.throws(() => checkZip(join(dir, 'bad.zip'), 'index.html'), /unsafe entries: leak/);
	assert.throws(() => checkZip(join(dir, 'ok.zip'), 'play.html'), /no play.html/);
});
