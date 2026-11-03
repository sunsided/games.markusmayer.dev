import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { compareVersions, fill } from '../src/lib/registry.ts';
import { checkZip, loadGames } from '../scripts/lib.ts';

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

// `zip` is only needed to build the fixtures; skip without it. `zipinfo` is not skipped
// for: the release sync and the build fetch cannot run without it either.
const hasZip = (() => {
	try {
		execFileSync('zip', ['-v'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
})();

test('checkZip gates what a web zip may hold', { skip: !hasZip && 'zip not installed' }, () => {
	const dir = mkdtempSync(join(tmpdir(), 'zip-'));
	const zip = (name: string, ...files: string[]) => {
		execFileSync('zip', ['-q', '-y', name, ...files], { cwd: dir });
		return join(dir, name);
	};
	writeFileSync(join(dir, 'index.html'), '<!doctype html>');
	writeFileSync(join(dir, 'other.html'), '<!doctype html>');
	mkdirSync(join(dir, 'play.html'));
	writeFileSync(join(dir, 'play.html', 'x'), '');
	symlinkSync('/etc/passwd', join(dir, 'leak'));

	assert.deepEqual(checkZip(zip('ok.zip', 'index.html'), 'index.html'), ['index.html']);
	assert.throws(
		() => checkZip(zip('link.zip', 'index.html', 'leak'), 'index.html'),
		/unsafe entries: leak/
	);
	assert.throws(() => checkZip(zip('none.zip', 'other.html'), 'index.html'), /no index.html file/);
	// The entry as a folder is not the entry.
	assert.throws(() => checkZip(zip('dir.zip', 'play.html'), 'play.html'), /no play.html file/);
});
