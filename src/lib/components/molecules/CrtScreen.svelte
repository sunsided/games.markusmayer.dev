<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A cathode-ray tube's face: curved glass, scanlines, a phosphor mask, a vignette and the
	 * room's reflection, glowing into the room in the game's colour.
	 *
	 * `power` runs the switch-on once: a bright line that opens into the picture. `live`
	 * takes the scanlines and mask off while a game is running inside, since the games
	 * draw their own and a second layer would muddy them; the glass stays.
	 */
	let {
		aspect = '16 / 10',
		power = false,
		delay = 0,
		live = false,
		children
	}: {
		aspect?: string;
		power?: boolean;
		delay?: number;
		live?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="crt" class:live style:aspect-ratio={aspect}>
	<div class="picture" class:power style:--delay={`${delay}ms`}>
		{@render children()}
	</div>
	<div class="mask" aria-hidden="true"></div>
	<div class="glass" aria-hidden="true"></div>
</div>

<style>
	.crt {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		/* The tube bulges: rounder corners than the bezel's opening, and a dark rim. */
		border-radius: 4.5% / 6.5%;
		background: var(--glass);
		box-shadow:
			0 0 0 1px rgb(0 0 0 / 0.9),
			0 0 2.5rem -0.25rem color-mix(in oklab, var(--game-accent) 55%, transparent),
			0 0 7rem -1rem color-mix(in oklab, var(--game-accent) 35%, transparent);
	}

	.picture {
		position: absolute;
		inset: 0;
		transform-origin: 50% 50%;
	}
	.picture > :global(*) {
		inline-size: 100%;
		block-size: 100%;
	}

	/* Scanlines and an aperture-grille mask, multiplied over the picture. */
	.mask {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			repeating-linear-gradient(180deg, rgb(0 0 0 / 0) 0 2px, rgb(0 0 0 / 0.28) 2px 3px),
			repeating-linear-gradient(
				90deg,
				rgb(255 0 60 / 0.06) 0 1px,
				rgb(0 255 120 / 0.06) 1px 2px,
				rgb(40 90 255 / 0.06) 2px 3px
			);
		mix-blend-mode: multiply;
		transition: opacity var(--dur-mid) var(--ease-out);
	}
	.live .mask {
		opacity: 0;
	}

	/* Vignette into the rim, a soft bloom, and the room's light sitting on the glass. */
	.glass {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		background:
			radial-gradient(130% 120% at 50% 50%, transparent 62%, rgb(0 0 0 / 0.55) 100%),
			linear-gradient(
				155deg,
				rgb(255 255 255 / 0.13) 0%,
				rgb(255 255 255 / 0.04) 22%,
				transparent 38%
			),
			radial-gradient(60% 40% at 30% 12%, rgb(255 255 255 / 0.08), transparent 70%);
		box-shadow:
			inset 0 0 1.5rem rgb(0 0 0 / 0.65),
			inset 0 0 0 1px rgb(255 255 255 / 0.04);
	}
	.live .glass {
		background:
			radial-gradient(130% 120% at 50% 50%, transparent 75%, rgb(0 0 0 / 0.35) 100%),
			linear-gradient(155deg, rgb(255 255 255 / 0.06) 0%, transparent 30%);
	}

	/*
		Switching on: the electron beam draws one bright line across the middle, the line
		opens into the full picture, the picture settles from overbright to normal.
	*/
	.power {
		animation: power-on var(--dur-power) var(--ease-out) var(--delay) both;
	}
	@keyframes power-on {
		0% {
			transform: scale(0.02, 0.004);
			filter: brightness(8) saturate(0);
			opacity: 0;
		}
		12% {
			transform: scale(0.02, 0.004);
			filter: brightness(8) saturate(0);
			opacity: 1;
		}
		32% {
			transform: scale(1, 0.006);
			filter: brightness(6) saturate(0);
		}
		58% {
			transform: scale(1, 1);
			filter: brightness(2.2) saturate(0.6);
		}
		100% {
			transform: none;
			filter: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.power {
			animation: none;
		}
	}
</style>
