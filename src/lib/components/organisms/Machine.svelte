<script lang="ts">
	import type { Snippet } from 'svelte';
	import { aspectSize, type Released } from '#lib/registry.js';
	import CrtScreen from '../molecules/CrtScreen.svelte';
	import ArcadeCabinet from './ArcadeCabinet.svelte';
	import DeviceStand from './DeviceStand.svelte';
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
		children,
		front
	}: {
		game: Released;
		power?: boolean;
		delay?: number;
		live?: boolean;
		children: Snippet;
		/** Interface over the screen's glass, such as the Play key. */
		front?: Snippet;
	} = $props();

	const aspect = $derived(game.web?.aspect ?? '16 / 10');
	/** The glass as percentages of the frame, for a device that draws its own case. */
	const glass = $derived.by(() => {
		const g = game.web?.glass;
		const f = aspectSize(game.web?.aspect);
		if (!g || !f) return undefined;
		return {
			left: (g[0] / f[0]) * 100,
			top: (g[1] / f[1]) * 100,
			width: (g[2] / f[0]) * 100,
			height: (g[3] / f[1]) * 100
		};
	});
</script>

<div class="machine" data-frame={game.frame ?? 'pc'} style:--game-accent={game.accent}>
	{#snippet tube()}
		<CrtScreen {aspect} {power} {delay} {live} {front}>{@render children()}</CrtScreen>
	{/snippet}
	{#snippet face()}{@render children()}{/snippet}
	{#if game.frame === 'device'}
		<DeviceStand {aspect} {glass} {live} screen={face} {front} />
	{:else if game.frame === 'arcade'}
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
