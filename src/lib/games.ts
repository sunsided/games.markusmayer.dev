// The registry as the site sees it: every games/*.json, validated at build time, so a bad
// entry fails `vite build` rather than rendering half a card.

import { byOrder, isReleased, validate, type Game, type Released } from './registry.ts';

const files = import.meta.glob<unknown>(['../../games/*.json', '!../../games/schema.json'], {
	eager: true,
	import: 'default'
});

const registered: Game[] = Object.entries(files).map(([path, data]) => {
	const game = validate(data, path);
	if (!path.endsWith(`/${game.slug}.json`))
		throw new Error(`${path}: slug "${game.slug}" ≠ file name`);
	return game;
});

/** The games with a release: registered but unreleased ones wait off the floor. */
export const games: Released[] = registered.filter(isReleased).sort(byOrder);

export const listed = games.filter((g) => !g.hidden);

export function game(slug: string): Released | undefined {
	return games.find((g) => g.slug === slug);
}
