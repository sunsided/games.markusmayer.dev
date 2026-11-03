<script lang="ts">
	import { asset } from '$app/paths';
	import { buildPath, coverPath, type Game } from '#lib/registry.js';
	import { tick } from 'svelte';

	// Fetched by `task builds`, so not static files the type of asset() knows at check time.
	type Asset = Parameters<typeof asset>[0];

	/**
	 * What a machine's tube shows. `still`: the title card, nothing to press (the exhibit
	 * around it is the link). `playable`: the title card with a Play key; pressing it swaps
	 * in the game itself. The build, megabytes of wasm, only loads then, and the press is the
	 * gesture the browser wants before the game may make a sound.
	 */
	let {
		game,
		mode = 'still',
		playing = $bindable(false),
		frame = $bindable(),
		query
	}: {
		game: Game;
		mode?: 'still' | 'playable';
		playing?: boolean;
		frame?: HTMLIFrameElement;
		/** Launch options instead of the game's default `web.query`; '' for none. */
		query?: string;
	} = $props();

	const cover = $derived(game.cover ? asset(coverPath(game)! as Asset) : undefined);
	const src = $derived.by(() => {
		if (!game.web) return undefined;
		const url = asset(buildPath(game) as Asset);
		const q = query ?? game.web.query;
		return q ? `${url}?${q}` : url;
	});

	/*
		Games that scale their screen by whole numbers only (most retro-styled ones do) would
		draw at 1x in a 600-pixel tube, a postage stamp in the middle. So the frame gets the
		next whole multiple of the game's own screen, and is scaled to fit the tube: a few
		percent down, never a blurry blow-up. Fullscreen is untouched, since browsers drop
		transforms on a fullscreen element and give it the whole display.
	*/
	let viewW = $state(0);
	let viewH = $state(0);
	const fit = $derived.by(() => {
		const native = game.web?.native;
		if (!native || !viewW || !viewH) return undefined;
		const k = Math.max(1, Math.ceil(Math.max(viewW / native[0], viewH / native[1])));
		const w = native[0] * k;
		const h = native[1] * k;
		return { w, h, scale: Math.min(viewW / w, viewH / h) };
	});

	async function play() {
		playing = true;
		await tick();
		frame?.focus();
	}
</script>

{#snippet card(alt: string)}
	{#if cover}
		<img class="art" src={cover} {alt} />
	{:else}
		<span class="fallback"><span>{game.title}</span></span>
	{/if}
{/snippet}

{#if playing && src}
	<div class="view" bind:clientWidth={viewW} bind:clientHeight={viewH}>
		<!-- Same origin and our own attested build, so no sandbox: the game needs storage,
		     audio and the GPU like any page would. -->
		{#key src}
			<iframe
				bind:this={frame}
				{src}
				title={`${game.title}, the game`}
				allow="fullscreen; gamepad; autoplay"
				allowfullscreen
				class:fitted={fit}
				style:inline-size={fit ? `${fit.w}px` : undefined}
				style:block-size={fit ? `${fit.h}px` : undefined}
				style:transform={fit ? `scale(${fit.scale})` : undefined}
			></iframe>
		{/key}
	</div>
{:else if mode === 'playable' && src}
	<button type="button" class="poster" onclick={play}>
		{@render card(game.cover?.alt ?? '')}
		<span class="key"><span class="label">Play {game.title}</span></span>
	</button>
{:else}
	{@render card('')}
{/if}

<style>
	iframe,
	.poster,
	.art,
	.fallback {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		border: 0;
	}
	.view {
		position: relative;
		overflow: hidden;
		background: #000;
	}
	iframe {
		background: #000;
	}
	iframe.fitted {
		position: absolute;
		top: 50%;
		left: 50%;
		max-inline-size: none;
		translate: -50% -50%;
		transform-origin: 50% 50%;
	}
	.art {
		object-fit: cover;
		image-rendering: pixelated;
	}
	.fallback {
		display: grid;
		place-items: center;
		padding: 8%;
		text-align: center;
		font-size: clamp(1.25rem, 6cqi, 3rem);
		font-weight: 850;
		font-stretch: var(--wdth-display);
		line-height: 1;
		color: var(--game-accent);
		background: radial-gradient(circle at 50% 45%, #1d1a2a, #050507 75%);
		text-shadow: 0 0 1.2rem color-mix(in oklab, var(--game-accent) 70%, transparent);
	}

	.poster {
		position: relative;
		padding: 0;
		background: #000;
		cursor: pointer;
	}
	.poster:focus-visible {
		outline-offset: -4px;
	}
	/* The key sits in the middle of the picture, over a soft pool of shade. */
	.key {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: radial-gradient(
			circle at center,
			rgb(0 0 0 / 0.45) 0,
			rgb(0 0 0 / 0.15) 35%,
			transparent 60%
		);
		transition: background-color var(--dur-mid) var(--ease-out);
	}
	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.6em;
		padding: 0.8em 1.4em 0.85em 1.15em;
		border-radius: var(--radius-pill);
		font-size: clamp(0.95rem, 0.7rem + 0.8vw, 1.2rem);
		font-weight: 700;
		font-stretch: var(--wdth-display);
		line-height: 1;
		color: var(--color-accent-ink);
		background: var(--color-accent);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.5),
			0 4px 0 color-mix(in oklab, var(--color-accent) 50%, #000),
			0 1.2rem 2.5rem rgb(0 0 0 / 0.6);
		transition: scale var(--dur-fast) var(--ease-snap);
	}
	.label::before {
		content: '';
		inline-size: 0;
		block-size: 0;
		border-block: 0.42em solid transparent;
		border-inline-start: 0.7em solid currentColor;
	}
	.poster:hover .key,
	.poster:focus-visible .key {
		background-color: rgb(0 0 0 / 0.12);
	}
	.poster:hover .label,
	.poster:focus-visible .label {
		scale: 1.06;
	}
	.poster:active .label {
		scale: 0.98;
	}
</style>
