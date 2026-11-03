<script lang="ts">
	import { resolve } from '$app/paths';
	import { LINKS } from '#lib/site.js';
	import GithubMark from '../atoms/GithubMark.svelte';
	import Monogram from '../atoms/Monogram.svelte';
</script>

<header class="site-header">
	<a class="home" href={resolve('/')}>
		<Monogram size="0.8rem" />
		<span class="name">Games <span class="by">by Markus Mayer</span></span>
	</a>
	<nav class="out" aria-label="Elsewhere">
		<a href={LINKS.home}>markusmayer.dev</a>
		<a class="icon" href={LINKS.github} aria-label="GitHub" title="GitHub"><GithubMark /></a>
	</nav>
</header>

<style>
	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		inline-size: min(var(--page-max), 100% - 2 * var(--gutter));
		margin-inline: auto;
		padding-block: var(--space-5);
	}
	.home {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		text-decoration: none;
	}
	.name {
		font-size: var(--step-0);
		font-weight: 720;
		font-stretch: var(--wdth-display);
		letter-spacing: -0.01em;
	}
	.by {
		font-weight: 450;
		font-stretch: var(--wdth-text);
		color: var(--color-text-muted);
	}
	.out {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
	/*
		The GitHub mark's kaleidoscope, after synthie-trombone's: rays in four colours radiating
		around it, a faint glimmer at rest. On hover or focus it goes further than there: the
		rays brighten, grow and spin, a second ring with a different spacing turns the other
		way so the two interfere like a kaleidoscope, and the mark itself pops with a glow that
		cycles through the colours.
	*/
	.icon {
		--ray-a: #00f0ff;
		--ray-b: #a85cff;
		--ray-c: #ff2eaa;
		--ray-d: #ff8c28;
		position: relative;
		isolation: isolate;
		display: grid;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		margin-inline-end: -0.5rem;
		border-radius: 50%;
		transition:
			color var(--dur-fast) var(--ease-out),
			scale var(--dur-mid) var(--ease-snap);
	}
	.icon::before,
	.icon::after {
		content: '';
		position: absolute;
		inset: -1rem;
		z-index: -1;
		border-radius: 50%;
		pointer-events: none;
		transition:
			opacity var(--dur-mid) var(--ease-out),
			transform 420ms var(--ease-snap);
	}
	.icon::before {
		background: repeating-conic-gradient(
			from 0deg,
			var(--ray-a) 0deg 3deg,
			transparent 3deg 15deg,
			var(--ray-b) 15deg 18deg,
			transparent 18deg 30deg,
			var(--ray-c) 30deg 33deg,
			transparent 33deg 45deg,
			var(--ray-d) 45deg 48deg,
			transparent 48deg 60deg
		);
		mask: radial-gradient(circle, transparent 34%, #000 40%, #000 52%, transparent 70%);
		opacity: 0.18;
		transform: scale(0.8);
	}
	/* The second ring: finer rays, out of step with the first, only there on hover. */
	.icon::after {
		inset: -1.6rem;
		background: repeating-conic-gradient(
			from 7deg,
			var(--ray-d) 0deg 2deg,
			transparent 2deg 9deg,
			var(--ray-a) 9deg 11deg,
			transparent 11deg 18deg,
			var(--ray-c) 18deg 20deg,
			transparent 20deg 27deg,
			var(--ray-b) 27deg 29deg,
			transparent 29deg 36deg
		);
		mask: radial-gradient(circle, transparent 30%, #000 38%, #000 56%, transparent 72%);
		mix-blend-mode: screen;
		opacity: 0;
		transform: scale(0.5) rotate(-30deg);
	}
	.icon :global(.github-mark) {
		transition: filter var(--dur-mid) var(--ease-out);
	}

	.icon:hover,
	.icon:focus-visible {
		color: #fff;
		scale: 1.15;
	}
	.icon:hover::before,
	.icon:focus-visible::before {
		opacity: 1;
		transform: scale(1.2);
		animation: rays 3.5s linear infinite;
	}
	.icon:hover::after,
	.icon:focus-visible::after {
		opacity: 0.9;
		transform: scale(1.15);
		animation: rays-back 2.2s linear infinite;
	}
	.icon:hover :global(.github-mark),
	.icon:focus-visible :global(.github-mark) {
		animation: prism 2.4s linear infinite;
	}
	@keyframes rays {
		to {
			rotate: 360deg;
		}
	}
	@keyframes rays-back {
		to {
			rotate: -360deg;
		}
	}
	@keyframes prism {
		0%,
		100% {
			filter: drop-shadow(0 0 0.35rem var(--ray-a));
		}
		25% {
			filter: drop-shadow(0 0 0.35rem var(--ray-b));
		}
		50% {
			filter: drop-shadow(0 0 0.35rem var(--ray-c));
		}
		75% {
			filter: drop-shadow(0 0 0.35rem var(--ray-d));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.icon:hover::before,
		.icon:hover::after,
		.icon:focus-visible::before,
		.icon:focus-visible::after,
		.icon:hover :global(.github-mark),
		.icon:focus-visible :global(.github-mark) {
			animation: none;
		}
	}
	@media (max-width: 30rem) {
		.by {
			display: none;
		}
	}
</style>
