<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/atoms/Button.svelte';
	import Led from '#lib/components/atoms/Led.svelte';
	import PlayKey from '#lib/components/molecules/PlayKey.svelte';
	import SpecList, { type Spec } from '#lib/components/molecules/SpecList.svelte';
	import GameScreen from '#lib/components/organisms/GameScreen.svelte';
	import Machine from '#lib/components/organisms/Machine.svelte';
	import { releaseDate } from '#lib/format.js';
	import { coverPath, fill, type Options } from '#lib/registry.js';
	import { ORIGIN } from '#lib/site.js';
	import { tick } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const game = $derived(data.game);
	const links = $derived(
		(game.links ?? []).map((l) => ({ ...l, url: fill(l.url, game.release.version) }))
	);
	const ogImage = $derived(game.cover ? `${ORIGIN}/${coverPath(game)}` : undefined);

	let playing = $state(false);
	let screen: HTMLElement | undefined = $state();
	/** The launch options of the version picked below the description, if any. */
	let options: Options | undefined = $state();
	const current = $derived(JSON.stringify(options ?? game.web?.options ?? {}));

	async function launch(o: Options) {
		options = o;
		playing = true;
		await tick();
		screen?.focus();
	}

	function fullscreen() {
		screen?.requestFullscreen?.().catch(() => {});
		screen?.focus();
	}

	const specs = $derived<Spec[]>([
		...(game.platform ? [{ term: 'Styled on', detail: game.platform }] : []),
		{ term: 'Release', detail: release },
		{ term: 'Released', detail: releaseDate(game.release.date) },
		{ term: 'Source', detail: source }
	]);
</script>

{#snippet release()}
	<a href={game.release.url}>{game.release.version}</a>
{/snippet}
{#snippet source()}
	<a href={`https://github.com/${game.repo}`}>{game.repo}</a>
{/snippet}

<svelte:head>
	<title>{game.title} · Games by Markus Mayer</title>
	<meta name="description" content={`${game.title}: ${game.tagline}`} />
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

<nav class="crumbs" aria-label="Breadcrumb">
	<a href={resolve('/')}>All games</a>
</nav>

<article class="game" data-frame={game.frame ?? 'pc'}>
	<div class="machine-col">
		<div class="rig">
			{#snippet front()}
				{#if game.web && !playing}
					<PlayKey label={`Play ${game.title}`} onclick={() => (playing = true)} />
				{/if}
			{/snippet}
			<Machine {game} power live={playing} {front}>
				<GameScreen {game} {options} bind:playing bind:screen />
			</Machine>
			<div class="console">
				<span class="state">
					<Led color={playing ? 'green' : 'amber'} size="0.6rem" />
					{playing ? 'Running' : game.web ? 'Ready' : 'No browser build'}
				</span>
				{#if playing}
					<Button variant="quiet" onclick={fullscreen}>Fullscreen</Button>
				{/if}
			</div>
		</div>
	</div>

	<div class="about">
		<header class="head">
			<h1>{game.title}</h1>
			<p class="tagline">{game.tagline}</p>
		</header>
		{#if game.description}<p class="description">{game.description}</p>{/if}
		{#if playing}
			<p class="hint">Click the game to give it the keyboard.</p>
		{:else if game.web}
			<p class="hint">Press Play on the screen to load it, a few megabytes of WebAssembly.</p>
		{/if}
		{#if game.web?.variants?.length}
			<ul class="variants">
				{#each game.web.variants as v (v.label)}
					<li>
						<Button
							variant={playing && current === JSON.stringify(v.options) ? 'primary' : 'quiet'}
							onclick={() => launch(v.options)}>{v.label}</Button
						>
					</li>
				{/each}
			</ul>
		{/if}
		<SpecList items={specs} />
		{#if links.length}
			<ul class="links">
				{#each links as link (link.url)}
					<li><Button variant="quiet" href={link.url}>{link.label}</Button></li>
				{/each}
			</ul>
		{/if}
		{#if game.cover?.credit}<p class="credit">{game.cover.credit}</p>{/if}
	</div>
</article>

<style>
	.crumbs {
		padding-block: var(--space-4) var(--space-6);
		font-size: var(--step--1);
	}
	.crumbs a {
		color: var(--color-text-muted);
	}
	.crumbs a::before {
		content: '‹ ';
	}

	.game {
		display: grid;
		gap: var(--space-7) var(--space-8);
	}
	@media (min-width: 62rem) {
		.game {
			grid-template-columns: minmax(0, 1.65fr) minmax(19rem, 1fr);
			align-items: start;
		}
		.game[data-frame='arcade'] {
			grid-template-columns: minmax(0, 1.25fr) minmax(19rem, 1fr);
		}
		.about {
			position: sticky;
			top: var(--space-6);
		}
	}

	.machine-col {
		display: grid;
		justify-items: center;
	}
	/* The machine and its status row, as one: never taller than the window, so the whole
	   machine and its screen stay in view. */
	.rig {
		display: grid;
		gap: var(--space-5);
		inline-size: 100%;
	}
	.game[data-frame='pc'] .rig {
		max-inline-size: calc((100dvh - 9rem) * 1.12);
	}
	.game[data-frame='device'] .rig {
		max-inline-size: calc((100dvh - 9rem) * 1.55);
	}
	.game[data-frame='arcade'] .rig {
		max-inline-size: calc((100dvh - 8rem) * 0.7);
	}

	.console {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-block-size: 2.75rem;
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.about {
		display: grid;
		gap: var(--space-5);
	}
	.head {
		display: grid;
		gap: var(--space-2);
	}
	h1 {
		font-size: var(--step-4);
		font-weight: 800;
		letter-spacing: -0.03em;
	}
	.tagline {
		font-size: var(--step-1);
		line-height: var(--leading-snug);
		color: var(--color-text-muted);
	}
	.description {
		max-inline-size: var(--measure);
	}
	.hint {
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
	.variants,
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.credit {
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
</style>
