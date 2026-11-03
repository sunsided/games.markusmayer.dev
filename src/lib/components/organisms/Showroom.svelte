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
		<li class="exhibit" data-frame={game.frame ?? 'pc'} style:--game-accent={game.accent}>
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
		/* Its own stacking context, so the floor layers behind the machines stay in front of
		   the room's fixed wall layers. */
		isolation: isolate;
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

	/*
		The floor: a glossy plane in perspective, starting at the machines' feet and running
		toward the viewer under the plaques. Tile joins converge into the distance, the
		screen's light pools on it in the game's colour, and it fades into the room. Each
		exhibit draws its own stretch, wide enough to meet its neighbours across the gap.
	*/
	.stage::after {
		content: '';
		position: absolute;
		z-index: -1;
		inset-inline: calc(var(--floor-gap) / -2);
		top: calc(100% - var(--space-5));
		block-size: 22rem;
		pointer-events: none;
		background:
			radial-gradient(
				45% 55% at 50% 0%,
				color-mix(in oklab, var(--game-accent) 30%, transparent),
				transparent 75%
			),
			radial-gradient(60% 40% at 50% 0%, rgb(0 0 0 / 0.5), transparent 70%),
			linear-gradient(180deg, rgb(255 255 255 / 0.06), transparent 30%);
		border-top: 1px solid rgb(255 255 255 / 0.1);
		mask-image: linear-gradient(180deg, #000 0%, rgb(0 0 0 / 0.5) 45%, transparent 90%);
	}
	.stage::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset-inline: calc(var(--floor-gap) / -2);
		top: calc(100% - var(--space-5));
		block-size: 22rem;
		pointer-events: none;
		background:
			repeating-linear-gradient(90deg, rgb(255 255 255 / 0.07) 0 1px, transparent 1px 4rem),
			repeating-linear-gradient(180deg, rgb(255 255 255 / 0.06) 0 1px, transparent 1px 4rem);
		transform: perspective(26rem) rotateX(62deg);
		transform-origin: 50% 0;
		mask-image: linear-gradient(180deg, #000 0%, transparent 70%);
	}

	/* The machine mirrored faintly in the gloss (where the browser can: an enhancement). */
	.stage > :global(.machine) {
		-webkit-box-reflect: below var(--space-5)
			linear-gradient(180deg, transparent 0%, transparent 84%, rgb(255 255 255 / 0.12) 100%);
	}

	/*
		The plaque must not be positioned: its title's link stretches over the nearest
		positioned ancestor, which has to be the whole exhibit, machine included. (The floor
		is already behind it, in the floor's own stacking context.)
	*/

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
