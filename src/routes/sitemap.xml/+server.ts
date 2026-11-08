// The index and every listed game's page. Hidden games have pages but stay out, as they
// stay off the floor. A page's lastmod is its game's release; the index's the newest one.

import { listed } from '#lib/games.js';
import { ORIGIN } from '#lib/site.js';

export const prerender = true;

export function GET() {
	const pages = [
		{
			loc: `${ORIGIN}/`,
			lastmod: listed
				.map((g) => g.release.date)
				.sort()
				.at(-1)
		},
		...listed.map((g) => ({ loc: `${ORIGIN}/${g.slug}/`, lastmod: g.release.date }))
	];
	const urls = pages
		.map(
			({ loc, lastmod }) =>
				`\t<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
		)
		.join('\n');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
