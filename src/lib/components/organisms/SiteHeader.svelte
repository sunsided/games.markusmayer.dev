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
		<a class="icon" href={LINKS.github} aria-label="GitHub" title="GitHub"
			><span class="burst" aria-hidden="true"></span><GithubMark /></a
		>
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
		around it, a faint glimmer at rest. On hover or focus it goes much further than there:
		the small ring brightens and spins, a burst of two counter-rotating rings unfolds from
		the mark across most of the window, and the mark pops with a glow that cycles through
		the colours.
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
	.icon::before {
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
	/*
		The burst: two rings of rays, as wide as most of the window, counter-rotating so they
		interfere like a kaleidoscope. Folded into the icon at rest, unfolding out of it on
		hover. They pass over the page without catching the pointer.
	*/
	.burst {
		position: absolute;
		left: 50%;
		top: 50%;
		z-index: -1;
		inline-size: min(90vmin, 60rem);
		block-size: min(90vmin, 60rem);
		translate: -50% -50%;
		pointer-events: none;
		opacity: 0;
		transform: scale(0.04) rotate(-90deg);
		transition:
			opacity 260ms var(--ease-out),
			transform 700ms var(--ease-snap);
	}
	.burst::before,
	.burst::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
	}
	.burst::before {
		background: repeating-conic-gradient(
			from 0deg,
			var(--ray-a) 0deg 1.4deg,
			transparent 1.4deg 7.5deg,
			var(--ray-b) 7.5deg 8.9deg,
			transparent 8.9deg 15deg,
			var(--ray-c) 15deg 16.4deg,
			transparent 16.4deg 22.5deg,
			var(--ray-d) 22.5deg 23.9deg,
			transparent 23.9deg 30deg
		);
		mask: radial-gradient(circle, transparent 3%, #000 6%, #000 38%, transparent 70%);
		opacity: 0.85;
	}
	.burst::after {
		background: repeating-conic-gradient(
			from 3deg,
			var(--ray-d) 0deg 0.8deg,
			transparent 0.8deg 4deg,
			var(--ray-a) 4deg 4.8deg,
			transparent 4.8deg 8deg,
			var(--ray-c) 8deg 8.8deg,
			transparent 8.8deg 12deg,
			var(--ray-b) 12deg 12.8deg,
			transparent 12.8deg 16deg
		);
		mask: radial-gradient(circle, transparent 5%, #000 10%, #000 30%, transparent 62%);
		mix-blend-mode: screen;
		opacity: 0.7;
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
	.icon:hover .burst,
	.icon:focus-visible .burst {
		opacity: 1;
		transform: none;
	}
	.icon:hover .burst::before,
	.icon:focus-visible .burst::before {
		animation: rays 9s linear infinite;
	}
	.icon:hover .burst::after,
	.icon:focus-visible .burst::after {
		animation: rays-back 6s linear infinite;
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
		.icon:focus-visible::before,
		.icon:hover .burst::before,
		.icon:hover .burst::after,
		.icon:focus-visible .burst::before,
		.icon:focus-visible .burst::after,
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
