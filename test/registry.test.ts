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
