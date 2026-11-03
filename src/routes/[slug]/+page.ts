import { error } from '@sveltejs/kit';
import { game, games } from '#lib/games.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => games.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const found = game(params.slug);
	if (!found) error(404, 'No such game');
	return { game: found };
};
