<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { buildPath, fill } from '#lib/registry.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const game = $derived(data.game);
	// Fetched by `task builds`, so not a static file the type of asset() knows at check time.
	type Asset = Parameters<typeof asset>[0];
	const src = $derived(game.web ? asset(buildPath(game) as Asset) : undefined);
	const links = $derived(
		(game.links ?? []).map((l) => ({ ...l, url: fill(l.url, game.release.version) }))
	);

	let frame: HTMLIFrameElement | undefined = $state();

	function fullscreen() {
		frame?.requestFullscreen?.().catch(() => {});
		frame?.focus();
	}
</script>

<svelte:head>
	<title>{game.title} · Games · Markus Mayer</title>
	<meta name="description" content={`${game.title} — ${game.tagline}`} />
</svelte:head>

<p class="back"><a href={resolve('/')}>← All games</a></p>

<h1>{game.title}</h1>
<p class="tagline">{game.tagline}</p>

{#if src}
	<div class="stage" style:aspect-ratio={game.web?.aspect ?? '16 / 10'}>
		<!-- Same origin and our own attested build, so no sandbox: the game needs storage,
		     audio and the GPU like any page would. -->
		<iframe
			bind:this={frame}
			{src}
			title={`${game.title} (game)`}
			allow="fullscreen; gamepad; autoplay"
			allowfullscreen
		></iframe>
	</div>
	<div class="controls">
		<button type="button" onclick={fullscreen}>⛶ Fullscreen</button>
		<span class="hint">Click the game to give it the keyboard.</span>
	</div>
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
