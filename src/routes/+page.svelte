<script lang="ts">
	import { resolve } from '$app/paths';
	import { listed } from '#lib/games.js';

	const date = (iso: string) =>
		new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
</script>

<svelte:head>
	<title>Games · Markus Mayer</title>
	<meta
		name="description"
		content="Small games by Markus Mayer, most of them Rust compiled to WebAssembly, playable in the browser."
	/>
</svelte:head>

<h1>Insert coin.</h1>
<p class="lede">
	Small games, mostly Rust compiled to WebAssembly. Pick one and play it right here in the browser.
</p>

<ul class="grid">
	{#each listed as game (game.slug)}
		<li>
			<a class="card" href={`${resolve('/[slug]', { slug: game.slug })}/`}>
				<span class="marquee" aria-hidden="true">{game.title}</span>
				<span class="body">
					<span class="title">{game.title}</span>
					<span class="tagline">{game.tagline}</span>
					<span class="meta">
						<span>{game.release.version}</span>
						<span>{date(game.release.date)}</span>
						<span class="kind">{game.web ? '▶ Play in browser' : '↓ Download'}</span>
					</span>
				</span>
			</a>
		</li>
	{/each}
</ul>

<style>
	h1 {
		margin: 0;
		font: 600 clamp(2rem, 6vw, 3.5rem) / 1.1 var(--mono);
		letter-spacing: -0.02em;
	}
	.lede {
		max-width: 40rem;
		color: var(--muted);
		margin-block: 0.75rem 2.5rem;
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
		gap: 1.25rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		overflow: hidden;
		transition:
			border-color 120ms,
			transform 120ms;
	}
	.card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		.card:hover {
			transition: none;
			transform: none;
		}
	}
	/* Stand-in cover art: the title on a scanlined screen, until a game ships a cover. */
	.marquee {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 10;
		padding: 1rem;
		text-align: center;
		font: 700 clamp(1.5rem, 4vw, 2.25rem) / 1.1 var(--mono);
		color: var(--accent);
		text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 60%, transparent);
		background:
			repeating-linear-gradient(0deg, #0003 0 2px, transparent 2px 4px),
			radial-gradient(ellipse at center, #1d2530, #07090b 75%);
		border-bottom: 1px solid var(--line);
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem 1.125rem 1.125rem;
		flex: 1;
	}
	.title {
		font-weight: 650;
		font-size: 1.125rem;
	}
	.tagline {
		color: var(--muted);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.875rem;
		margin-top: auto;
		padding-top: 0.75rem;
		font: 0.8125rem var(--mono);
		color: var(--muted);
	}
	.kind {
		margin-left: auto;
		color: var(--accent);
	}
</style>
