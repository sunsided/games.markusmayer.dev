<script lang="ts">
	import Showroom from '#lib/components/organisms/Showroom.svelte';
	import { listed } from '#lib/games.js';
	import { ORIGIN } from '#lib/site.js';

	const description =
		'Retro-styled games written in Rust and compiled to WebAssembly, playable in the browser from the exact build each repository released.';
</script>

<svelte:head>
	<title>Games by Markus Mayer</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Games by Markus Mayer" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${ORIGIN}/`} />
</svelte:head>

<section class="intro">
	<h1>Pick a machine. Press Play.</h1>
	<p class="lede">
		Retro-styled games written in Rust and compiled to WebAssembly. Each one plays right here in
		your browser, from the exact build its repository released.
	</p>
</section>

<section class="room" aria-labelledby="floor-title">
	<h2 id="floor-title" class="visually-hidden">The games</h2>
	<Showroom games={listed} />
</section>

<style>
	.intro {
		display: grid;
		gap: var(--space-5);
		padding-block: clamp(2.5rem, 7vw, 6rem) clamp(3rem, 8vw, 6.5rem);
	}
	h1 {
		max-inline-size: 13ch;
		font-size: var(--step-5);
		font-weight: 800;
		letter-spacing: -0.035em;
	}
	.lede {
		max-inline-size: 46ch;
		font-size: var(--step-1);
		line-height: var(--leading-snug);
		color: var(--color-text-muted);
	}
</style>
