<script lang="ts">
	import type { Released } from '#lib/registry.js';
	import { releaseDate } from '#lib/format.js';

	/**
	 * The label beside a machine on the showroom floor: what it is, in a line, and which
	 * release is standing there. `href` makes the title the machine's link, stretched over
	 * the whole exhibit by the parent.
	 */
	let { game, href }: { game: Released; href?: string } = $props();
</script>

<div class="plaque">
	<h3 class="title">
		{#if href}<a class="stretch" {href}>{game.title}</a>{:else}{game.title}{/if}
	</h3>
	<p class="tagline">{game.tagline}</p>
	<p class="meta">
		{game.release.version}, released {releaseDate(game.release.date)}{#if game.platform}<br
			/>{game.platform}{/if}
	</p>
</div>

<style>
	.plaque {
		display: grid;
		gap: var(--space-1);
	}
	.title {
		font-size: var(--step-2);
	}
	.title a {
		text-decoration: none;
	}
	/* The whole exhibit is the link; the title carries its name for assistive tech. */
	.stretch::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 2;
	}
	.tagline {
		color: var(--color-text);
		opacity: 0.86;
	}
	.meta {
		margin-top: var(--space-2);
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
</style>
