<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { buildPath, coverPath, fill } from '#lib/registry.js';
	import { ORIGIN } from '#lib/site.js';
	import { tick } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const game = $derived(data.game);
	// Fetched by `task builds`, so not a static file the type of asset() knows at check time.
	type Asset = Parameters<typeof asset>[0];
	const src = $derived(game.web ? asset(buildPath(game) as Asset) : undefined);
	const cover = $derived(game.cover ? asset(coverPath(game)! as Asset) : undefined);
	const ogImage = $derived(game.cover ? `${ORIGIN}/${coverPath(game)}` : undefined);
	const links = $derived(
		(game.links ?? []).map((l) => ({ ...l, url: fill(l.url, game.release.version) }))
	);

	let frame: HTMLIFrameElement | undefined = $state();
	// The build (megabytes of wasm) only loads on Play; until then the title card stands in.
	// Pressing Play is also the gesture the browser wants before the game may make a sound.
	let playing = $state(false);

	async function play() {
		playing = true;
		await tick();
		frame?.focus();
	}

	function fullscreen() {
		frame?.requestFullscreen?.().catch(() => {});
		frame?.focus();
	}
</script>

<svelte:head>
	<title>{game.title} · Games · Markus Mayer</title>
	<meta name="description" content={`${game.title} — ${game.tagline}`} />
	<meta property="og:title" content={game.title} />
	<meta property="og:description" content={game.tagline} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${ORIGIN}/${game.slug}/`} />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
		<meta property="og:image:alt" content={game.cover?.alt} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>

<p class="back"><a href={resolve('/')}>← All games</a></p>

<h1>{game.title}</h1>
<p class="tagline">{game.tagline}</p>

{#if src}
	<div class="stage" style:aspect-ratio={game.web?.aspect ?? '16 / 10'}>
		{#if playing}
			<!-- Same origin and our own attested build, so no sandbox: the game needs storage,
			     audio and the GPU like any page would. -->
			<iframe
				bind:this={frame}
				{src}
				title={`${game.title} (game)`}
				allow="fullscreen; gamepad; autoplay"
				allowfullscreen
			></iframe>
		{:else}
			<button type="button" class="poster" onclick={play} aria-label={`Play ${game.title}`}>
				{#if cover}
					<img src={cover} alt={game.cover?.alt} />
				{:else}
					<span class="marquee">{game.title}</span>
				{/if}
				<span class="play" aria-hidden="true"><span>▶ Play</span></span>
			</button>
		{/if}
	</div>
	<div class="controls">
		{#if playing}
			<button type="button" onclick={fullscreen}>⛶ Fullscreen</button>
			<span class="hint">Click the game to give it the keyboard.</span>
		{:else}
			<span class="hint">Loads the game, a few megabytes of WebAssembly.</span>
		{/if}
		{#if game.cover?.credit}<span class="credit">{game.cover.credit}</span>{/if}
	</div>
{:else if cover}
	<figure class="stage still">
		<img src={cover} alt={game.cover?.alt} />
		{#if game.cover?.credit}<figcaption class="credit">{game.cover.credit}</figcaption>{/if}
	</figure>
{/if}

<section class="about">
	{#if game.description}<p>{game.description}</p>{/if}
	<dl>
		<dt>Release</dt>
		<dd><a href={game.release.url}>{game.release.version}</a></dd>
		{#if game.tags?.length}
			<dt>Tags</dt>
			<dd>{game.tags.join(' · ')}</dd>
		{/if}
	</dl>
	{#if links.length}
		<ul class="links">
			{#each links as link (link.url)}
				<li><a href={link.url}>{link.label}</a></li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.back {
		margin: 0 0 1rem;
		font: 0.875rem var(--mono);
	}
	.back a {
		color: var(--muted);
	}
	h1 {
		margin: 0;
		font: 600 clamp(1.75rem, 5vw, 2.75rem) / 1.1 var(--mono);
	}
	.tagline {
		margin: 0.25rem 0 1.5rem;
		color: var(--muted);
	}
	.stage {
		width: 100%;
		max-height: 80dvh;
		background: #000;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		overflow: hidden;
		margin-inline: auto;
	}
	iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}
	.poster {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: #000;
		cursor: pointer;
	}
	.poster img,
	.still img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		image-rendering: pixelated;
	}
	.poster .marquee {
		display: grid;
		place-items: center;
		height: 100%;
		font: 700 clamp(2rem, 6vw, 3.5rem) / 1.1 var(--mono);
		color: var(--accent);
		background:
			repeating-linear-gradient(0deg, #0003 0 2px, transparent 2px 4px),
			radial-gradient(ellipse at center, #1d2530, #07090b 75%);
	}
	/* A video-player Play: centred, over a light dim, so it reads on any title art. */
	.play {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: radial-gradient(circle at center, #0008 0, #0003 18rem, transparent 30rem);
		transition: background-color 120ms;
	}
	.play span {
		padding: 0.75rem 1.5rem;
		font: 700 1.25rem var(--mono);
		color: var(--accent-ink);
		background: var(--accent);
		border-radius: 999px;
		box-shadow:
			0 0 0 4px #000a,
			0 0.5rem 2rem #000c;
		transition: scale 120ms;
	}
	.poster:hover .play,
	.poster:focus-visible .play {
		background-color: #0002;
	}
	.poster:hover .play span,
	.poster:focus-visible .play span {
		scale: 1.08;
	}
	@media (prefers-reduced-motion: reduce) {
		.play,
		.play span {
			transition: none;
		}
	}
	.still {
		margin: 0;
		position: relative;
	}
	.still figcaption {
		position: absolute;
		right: 0.5rem;
		bottom: 0.375rem;
	}
	.credit {
		margin-left: auto;
		color: var(--muted);
		font: 0.75rem var(--mono);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		align-items: center;
		margin-top: 0.75rem;
	}
	button {
		font: 600 0.875rem var(--mono);
		color: var(--accent-ink);
		background: var(--accent);
		border: 0;
		border-radius: 0.25rem;
		padding: 0.5rem 0.875rem;
		cursor: pointer;
	}
	.hint {
		color: var(--muted);
		font-size: 0.875rem;
	}
	.about {
		max-width: 42rem;
		margin-top: 2rem;
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.25rem 1rem;
		font: 0.875rem var(--mono);
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
	}
	.links a {
		display: inline-block;
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--line);
		border-radius: 0.25rem;
		text-decoration: none;
		font: 0.875rem var(--mono);
	}
	.links a:hover {
		border-color: var(--accent);
	}
</style>
