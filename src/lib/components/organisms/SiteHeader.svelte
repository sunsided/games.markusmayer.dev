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
	.icon {
		display: grid;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		margin-inline-end: -0.5rem;
		border-radius: 50%;
		transition: color var(--dur-fast) var(--ease-out);
	}
	.icon:hover {
		color: var(--color-text);
	}
	@media (max-width: 30rem) {
		.by {
			display: none;
		}
	}
</style>
