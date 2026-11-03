<script module lang="ts">
	import type { Options } from '#lib/registry.js';

	/*
		Embedded games bind to their canvas once, by id, and have no teardown. So each game
		gets one canvas and one module for the whole visit, kept here, outside any component.
		Unmounting only takes the canvas out of the document, where the game pauses and goes
		quiet; mounting puts the same canvas back and restarts the game through its restart
		event, as if freshly launched. The loop, the GPU context and the unlocked sound stay.
	*/
	interface Embedded {
		canvas: HTMLCanvasElement;
		/** Loading its module and wasm, not yet bound to the canvas. */
		starting: boolean;
		/** Bound and running: from now on it is restarted, never started again. */
		running: boolean;
	}
	const embedded = new Map<string, Embedded>();

	/** Where a canvas waits, still in the document, when its page goes while it is starting:
	    the game looks it up by id when it binds, so it must be findable until then. */
	let lot: HTMLElement | null = null;
	function park(canvas: HTMLCanvasElement) {
		if (!lot) {
			lot = document.createElement('div');
			lot.setAttribute('aria-hidden', 'true');
			lot.style.cssText =
				'position:fixed;inset-inline-start:-200vw;inline-size:320px;block-size:200px;visibility:hidden;';
			document.body.append(lot);
		}
		lot.append(canvas);
	}

	function setData(canvas: HTMLCanvasElement, options: Options) {
		for (const [k, v] of Object.entries(options)) {
			if (v === false) delete canvas.dataset[k];
			else canvas.dataset[k] = v === true ? '' : v;
		}
	}
</script>

<script lang="ts">
	import { asset } from '$app/paths';
	import { buildPath, coverPath, toQuery, type Game } from '#lib/registry.js';

	// Fetched by `task builds`, so not static files the type of asset() knows at check time.
	type Asset = Parameters<typeof asset>[0];

	/**
	 * What a machine's tube shows: the title card, until `playing`, then the game itself. The
	 * build, megabytes of wasm, only loads then. The Play key is not drawn here but laid over
	 * the glass by the page (PlayKey, through Machine's `front`).
	 *
	 * Games with `web.module` and `web.canvas` run in this page, so the Play click is their
	 * own and they may start their sound at once. Others run in a frame, a separate document
	 * the click does not count for: they ask for a click of their own before making a sound.
	 */
	let {
		game,
		playing = $bindable(false),
		screen = $bindable(),
		options
	}: {
		game: Game;
		playing?: boolean;
		/** The element the game draws in, canvas or frame: for focus and fullscreen. */
		screen?: HTMLElement;
		/** Launch options instead of the game's defaults (`web.options`). */
		options?: Options;
	} = $props();

	const web = $derived(game.web);
	const embed = $derived(Boolean(web?.module && web?.canvas));
	const launch = $derived(options ?? web?.options ?? {});
	const folder = $derived(game.web ? asset(buildPath(game) as Asset).replace(/[^/]*$/, '') : '');
	const cover = $derived(game.cover ? asset(coverPath(game)! as Asset) : undefined);
	const src = $derived.by(() => {
		if (!web) return undefined;
		const q = toQuery(launch);
		return asset(buildPath(game) as Asset) + (q ? `?${q}` : '');
	});

	/*
		Games that scale their screen by whole numbers only (most retro-styled ones do) would
		draw at 1x in a 600-pixel tube, a postage stamp in the middle. So the game gets the
		next whole multiple of its own screen, scaled to fit the tube: a few percent down,
		never a blurry blow-up. Fullscreen is untouched: browsers drop transforms on a
		fullscreen element and give it the whole display.
	*/
	let viewW = $state(0);
	let viewH = $state(0);
	const fit = $derived.by(() => {
		const native = web?.native;
		if (!native || !viewW || !viewH) return undefined;
		const k = Math.max(1, Math.ceil(Math.max(viewW / native[0], viewH / native[1])));
		const w = native[0] * k;
		const h = native[1] * k;
		return { w, h, scale: Math.min(viewW / w, viewH / h) };
	});

	/*
		Through custom properties and an !important rule, not inline sizes: the game's window
		layer writes its own inline width and height onto the canvas, and would win. The
		browser's fullscreen rules are !important too, and theirs beat ours.
	*/
	function sizeTo(el: HTMLElement, f: typeof fit) {
		el.classList.toggle('fitted', Boolean(f));
		el.style.setProperty('--fit-w', f ? `${f.w}px` : '');
		el.style.setProperty('--fit-h', f ? `${f.h}px` : '');
		el.style.setProperty('--fit-scale', f ? `${f.scale}` : '');
	}

	/** Put the game's canvas into `slot`: start it the first time, restart it after. */
	function mount(slot: HTMLElement) {
		const id = web!.canvas!;
		let entry = embedded.get(game.slug);
		if (!entry) {
			const canvas = document.createElement('canvas');
			canvas.id = id;
			canvas.tabIndex = 0;
			canvas.className = 'game-canvas';
			canvas.setAttribute('aria-label', `${game.title}, the game`);
			entry = { canvas, starting: false, running: false };
			embedded.set(game.slug, entry);
		}
		const e = entry;
		setData(e.canvas, launch);
		slot.append(e.canvas);
		screen = e.canvas;

		if (e.running) {
			if (web!.restart) {
				e.canvas.dispatchEvent(new CustomEvent(web!.restart, { detail: { ...launch } }));
			}
		} else if (!e.starting) {
			e.starting = true;
			import(/* @vite-ignore */ new URL(folder + web!.module!, document.baseURI).href)
				.then((m: { default: () => Promise<void> }) =>
					// winit throws to leave its loop running, so this settles either way.
					m.default().catch(() => {})
				)
				.finally(() => {
					e.starting = false;
					e.running = true;
					if (lot && e.canvas.parentElement === lot) e.canvas.remove();
				});
		}
		e.canvas.focus();

		return () => {
			if (screen === e.canvas) screen = undefined;
			if (e.starting) park(e.canvas);
			else e.canvas.remove();
		};
	}

	// A different version picked while running: restart in place, sound and all.
	let launched = '';
	$effect(() => {
		const key = JSON.stringify(launch);
		const e = embed && playing ? embedded.get(game.slug) : undefined;
		if (e?.running && launched && key !== launched && web?.restart) {
			setData(e.canvas, launch);
			e.canvas.dispatchEvent(new CustomEvent(web.restart, { detail: { ...launch } }));
			e.canvas.focus();
		}
		launched = key;
	});

	$effect(() => {
		if (screen) sizeTo(screen, fit);
	});

	// The keyboard goes to the game as soon as it is on the tube.
	$effect(() => {
		if (playing && screen) screen.focus();
	});
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
		{#if embed}
			{#key game.slug}
				<div class="slot" {@attach mount}></div>
			{/key}
		{:else}
			<!-- Same origin and our own attested build, so no sandbox: the game needs storage,
			     audio and the GPU like any page would. -->
			{#key src}
				<iframe
					bind:this={screen}
					{src}
					title={`${game.title}, the game`}
					allow="fullscreen; gamepad; autoplay"
				></iframe>
			{/key}
		{/if}
	</div>
{:else}
	{@render card(game.cover?.alt ?? '')}
{/if}

<style>
	iframe,
	.art,
	.fallback,
	.slot {
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
	iframe,
	.view :global(.game-canvas) {
		display: block;
		background: #000;
		border: 0;
		outline: none;
	}
	.view :global(.game-canvas) {
		inline-size: 100% !important;
		block-size: 100% !important;
		touch-action: none;
		image-rendering: pixelated;
	}
	.view :global(.fitted) {
		position: absolute;
		top: 50%;
		left: 50%;
		inline-size: var(--fit-w) !important;
		block-size: var(--fit-h) !important;
		max-inline-size: none;
		translate: -50% -50%;
		transform: scale(var(--fit-scale));
		transform-origin: 50% 50%;
	}
	/*
		Fullscreen: the browser's own !important rules give the element the whole display and
		drop `transform`, but not `translate`, the separate property the fit centres with. Left
		on, it shifted the picture by half its size, showing its bottom-right quarter in the
		top-left corner. So everything the fit adds goes in fullscreen.
	*/
	.view :global(.game-canvas:fullscreen),
	iframe:fullscreen {
		translate: none !important;
		transform: none !important;
		scale: none !important;
		inline-size: 100% !important;
		block-size: 100% !important;
		inset: 0 !important;
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
</style>
