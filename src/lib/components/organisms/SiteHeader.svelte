<script lang="ts">
	import { resolve } from '$app/paths';
	import Monogram from '../atoms/Monogram.svelte';
</script>

<header class="site-header">
	<a class="home" href={resolve('/')}>
		<Monogram size="0.8rem" />
		<span class="name">Games <span class="by">by Markus Mayer</span></span>
	</a>
	<a class="out" href="https://markusmayer.dev/">markusmayer.dev</a>
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
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
	@media (max-width: 30rem) {
		.by {
			display: none;
		}
	}
</style>
