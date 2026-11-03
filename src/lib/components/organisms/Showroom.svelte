<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Game } from '#lib/registry.js';
	import Plaque from '../molecules/Plaque.svelte';
	import GameScreen from './GameScreen.svelte';
	import Machine from './Machine.svelte';

	/**
	 * The floor: every game standing in its machine, side by side on one shared floor line,
	 * each with its plaque. The screens switch on one after another when the page opens,
	 * the page's one piece of unprompted motion.
	 */
	let { games }: { games: Game[] } = $props();
</script>

<ul class="floor">
	{#each games as game, i (game.slug)}
		<li class="exhibit" data-frame={game.frame ?? 'pc'}>
			<div class="stage">
				<Machine {game} power delay={250 + i * 350}>
					<GameScreen {game} />
				</Machine>
			</div>
			<Plaque {game} href={`${resolve('/[slug]', { slug: game.slug })}/`} />
		</li>
	{/each}
</ul>

<style>
	.floor {
		--floor-gap: clamp(2rem, 5vw, 5rem);
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(19rem, 100%), 1fr));
		gap: var(--space-8) var(--floor-gap);
		align-items: end;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.exhibit {
		position: relative;
		display: grid;
		grid-template-rows: 1fr auto;
		gap: var(--space-6);
	}
	.stage {
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-block-end: var(--space-5);
	}
	/* Machines of different heights, at sizes that look like one room: the cabinet stands
	   taller than the monitor, both on the floor. */
	.exhibit[data-frame='pc'] .stage > :global(.machine) {
		inline-size: 100%;
	}
	.exhibit[data-frame='arcade'] .stage > :global(.machine) {
		inline-size: 78%;
	}

	/* The floor under each machine: a sheen, and the screen's light pooled on it. */
	.stage::after {
		content: '';
		position: absolute;
		inset-inline: calc(var(--floor-gap) / -2);
		bottom: 0;
		block-size: var(--space-5);
		background:
			radial-gradient(50% 100% at 50% 0%, rgb(0 0 0 / 0.55), transparent 70%),
			linear-gradient(180deg, rgb(255 255 255 / 0.05), transparent);
		border-top: 1px solid rgb(255 255 255 / 0.08);
		pointer-events: none;
	}

	/* Answering the pointer, without moving anything: the exhibit's screen comes up a little. */
	.exhibit :global(.crt) {
		transition: filter var(--dur-mid) var(--ease-out);
	}
	.exhibit:hover :global(.crt),
	.exhibit:focus-within :global(.crt) {
		filter: brightness(1.12) saturate(1.08);
	}
	.exhibit:focus-within :global(.stretch:focus-visible) {
		outline: none;
	}
	.exhibit:has(:global(.stretch:focus-visible)) .stage {
		outline: 2px solid var(--color-focus);
		outline-offset: 0.75rem;
		border-radius: var(--radius-m);
	}
</style>
