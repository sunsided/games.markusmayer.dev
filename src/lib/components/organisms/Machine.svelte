<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Game } from '#lib/registry.js';
	import CrtScreen from '../molecules/CrtScreen.svelte';
	import ArcadeCabinet from './ArcadeCabinet.svelte';
	import PcMonitor from './PcMonitor.svelte';

	/**
	 * A game's machine: the hardware of its era around a CRT, lit in the game's colour.
	 * `children` is what the tube shows.
	 */
	let {
		game,
		power = false,
		delay = 0,
		live = false,
		children
	}: {
		game: Game;
		power?: boolean;
		delay?: number;
		live?: boolean;
		children: Snippet;
	} = $props();

	const aspect = $derived(game.web?.aspect ?? '16 / 10');
</script>

<div class="machine" data-frame={game.frame ?? 'pc'} style:--game-accent={game.accent}>
	{#snippet tube()}
		<CrtScreen {aspect} {power} {delay} {live}>{@render children()}</CrtScreen>
	{/snippet}
	{#if game.frame === 'arcade'}
		<ArcadeCabinet title={game.title} screen={tube} />
	{:else}
		<PcMonitor on={live} screen={tube} />
	{/if}
</div>

<style>
	.machine {
		position: relative;
	}
	/* The light a running screen throws onto the wall behind it. */
	.machine::before {
		content: '';
		position: absolute;
		inset: -10% -18% 20%;
		z-index: -1;
		pointer-events: none;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--game-accent) 40%, transparent),
			transparent
		);
		filter: blur(24px);
	}
</style>
