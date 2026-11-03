<script lang="ts">
	import Showroom from '#lib/components/organisms/Showroom.svelte';
	import { listed } from '#lib/games.js';
	import { ORIGIN } from '#lib/site.js';

	const description =
		'Small, silly games in the clothes of DOS PCs and arcade cabinets, written in Rust and playable right in the browser.';
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
		Small, silly games in the clothes of DOS PCs and arcade cabinets. Pick one and it runs right
		here in your browser, nothing to install.
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
