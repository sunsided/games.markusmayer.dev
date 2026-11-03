// The registry as the site sees it: every games/*.json, validated at build time, so a bad
// entry fails `vite build` rather than rendering half a card.

import { byOrder, validate, type Game } from './registry.ts';

const files = import.meta.glob<unknown>(['../../games/*.json', '!../../games/schema.json'], {
	eager: true,
	import: 'default'
});

export const games: Game[] = Object.entries(files)
	.map(([path, data]) => {
		const game = validate(data, path);
		if (!path.endsWith(`/${game.slug}.json`))
			throw new Error(`${path}: slug "${game.slug}" ≠ file name`);
		return game;
	})
	.sort(byOrder);

export const listed = games.filter((g) => !g.hidden);

export function game(slug: string): Game | undefined {
	return games.find((g) => g.slug === slug);
}
