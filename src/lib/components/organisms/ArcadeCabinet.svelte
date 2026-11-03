<script lang="ts">
	import type { Snippet } from 'svelte';
	import Led from '../atoms/Led.svelte';

	/**
	 * The upper half of an upright arcade cabinet, seen from the front: a backlit marquee
	 * with the game's name, the screen behind a smoked bezel, the control panel with a stick
	 * and three buttons, and the coin door. T-molding down both sides in the game's colour.
	 */
	let { title, screen }: { title: string; screen: Snippet } = $props();
</script>

<div class="cab">
	<div class="marquee" aria-hidden="true">
		<span class="name">{title}</span>
	</div>
	<div class="trim" aria-hidden="true"></div>
	<div class="bezel">
		{@render screen()}
	</div>
	<div class="panel" aria-hidden="true">
		<span class="stick"><span class="ball"></span></span>
		<span class="buttons">
			<span class="btn a"></span>
			<span class="btn b"></span>
			<span class="btn c"></span>
		</span>
		<span class="start">1P START</span>
	</div>
	<div class="door" aria-hidden="true">
		<span class="slot"><Led color="red" size="1.3cqi" /><span>25¢</span></span>
		<span class="slot"><Led color="red" size="1.3cqi" /><span>25¢</span></span>
	</div>
</div>

<style>
	.cab {
		container-type: inline-size;
		position: relative;
		/* T-molding: a bright edge strip on both sides, catching light at its crown. */
		border-inline: 0.9cqi solid var(--game-accent);
		border-radius: 1.6cqi 1.6cqi 0.6cqi 0.6cqi;
		background: linear-gradient(
			90deg,
			var(--laminate-950),
			var(--laminate-900) 15% 85%,
			var(--laminate-950)
		);
		box-shadow:
			inset 0.5cqi 0 0 rgb(255 255 255 / 0.25),
			inset -0.5cqi 0 0 rgb(0 0 0 / 0.35),
			var(--shadow-object);
		overflow: hidden;
	}
	.cab::before {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline: -0.9cqi;
		pointer-events: none;
		background: linear-gradient(
			90deg,
			rgb(255 255 255 / 0.45) 0 0.25cqi,
			transparent 0.6cqi calc(100% - 0.6cqi),
			rgb(255 255 255 / 0.2) calc(100% - 0.25cqi)
		);
		z-index: 1;
	}

	/* Backlit translucent sign: brightest where the tube is, falling off to the corners. */
	.marquee {
		display: grid;
		place-items: center;
		block-size: 20cqi;
		padding: 0 6cqi;
		background:
			radial-gradient(
				55% 70% at 50% 55%,
				color-mix(in oklab, var(--game-accent) 85%, #fff) 0%,
				transparent 75%
			),
			radial-gradient(
				110% 160% at 50% 50%,
				color-mix(in oklab, var(--game-accent) 70%, #000) 0%,
				color-mix(in oklab, var(--game-accent) 18%, #000) 100%
			);
		box-shadow:
			inset 0 -1cqi 2cqi rgb(0 0 0 / 0.45),
			inset 0 0 0 0.4cqi rgb(0 0 0 / 0.5);
	}
	.name {
		font-size: 8.5cqi;
		font-weight: 900;
		font-stretch: var(--wdth-display);
		line-height: 0.95;
		letter-spacing: -0.03em;
		text-align: center;
		color: #fff8ec;
		-webkit-text-stroke: 0.35cqi color-mix(in oklab, var(--game-accent) 35%, #000);
		paint-order: stroke fill;
		text-shadow:
			0 0.6cqi 0 color-mix(in oklab, var(--game-accent) 30%, #000),
			0 0 3cqi rgb(255 255 255 / 0.65);
	}
	.trim {
		block-size: 1.2cqi;
		background: linear-gradient(180deg, #fff, var(--chrome-300) 40%, #6f6b78 100%);
	}

	/* Smoked plexiglass around the tube, its upper edge a little lighter. */
	.bezel {
		padding: 4cqi 4.5cqi 4.5cqi;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.07), transparent 25%),
			linear-gradient(180deg, #120e18, #07060a);
		box-shadow: inset 0 0 3cqi rgb(0 0 0 / 0.8);
	}

	/* The panel slopes toward the player: narrower at the back edge. */
	.panel {
		position: relative;
		isolation: isolate;
		display: flex;
		align-items: flex-end;
		gap: 9cqi;
		block-size: 21cqi;
		padding: 0 14cqi 3.5cqi;
		border-top: 0.5cqi solid #000;
	}
	/* The shape lives on its own layer: a clip-path on the panel itself would also cut off
	   the stick, which stands up out of it. */
	.panel::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.1), transparent 30%),
			linear-gradient(180deg, var(--laminate-700), var(--laminate-900));
		clip-path: polygon(4% 0, 96% 0, 100% 100%, 0 100%);
	}
	.stick {
		position: relative;
		inline-size: 9cqi;
		block-size: 9cqi;
		border-radius: 50%;
		background: radial-gradient(circle, #050407 40%, #1a1520 70%);
		box-shadow: inset 0 0.4cqi 0.8cqi #000;
	}
	.stick::before {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 45%;
		inline-size: 1.6cqi;
		block-size: 6.5cqi;
		translate: -50% 0;
		border-radius: 0.8cqi;
		background: linear-gradient(90deg, #4a4552, var(--chrome-300) 45%, #2b2733);
	}
	.ball {
		position: absolute;
		left: 50%;
		bottom: 95%;
		inline-size: 7.5cqi;
		block-size: 7.5cqi;
		translate: -50% 0;
		border-radius: 50%;
		background: radial-gradient(
			circle at 35% 30%,
			#fff 0 6%,
			var(--led-red) 30%,
			color-mix(in oklab, var(--led-red) 45%, #000) 100%
		);
		box-shadow: 0 0.8cqi 1cqi rgb(0 0 0 / 0.6);
	}
	.buttons {
		display: flex;
		gap: 3.5cqi;
		align-items: center;
	}
	.btn {
		--cap: var(--game-accent);
		inline-size: 7.5cqi;
		block-size: 7.5cqi;
		border-radius: 50%;
		background: radial-gradient(
			circle at 38% 32%,
			color-mix(in oklab, var(--cap) 30%, #fff) 0 10%,
			var(--cap) 45%,
			color-mix(in oklab, var(--cap) 50%, #000) 100%
		);
		box-shadow:
			0 0 0 0.8cqi #0a080d,
			0 0 0 1.1cqi rgb(255 255 255 / 0.12),
			0 1cqi 1cqi rgb(0 0 0 / 0.6);
	}
	.btn.b {
		--cap: var(--paper-100);
	}
	.btn.c {
		--cap: #46c6ff;
		translate: 0 -2.5cqi;
	}
	.btn.a {
		translate: 0 1cqi;
	}
	.start {
		position: absolute;
		right: 8cqi;
		bottom: 2.5cqi;
		font-family: var(--font-pixel);
		font-size: 2.2cqi;
		color: var(--mist-300);
		opacity: 0.6;
	}

	.door {
		display: flex;
		justify-content: center;
		gap: 8cqi;
		padding: 4cqi 0 5cqi;
		background: linear-gradient(180deg, #08060b, var(--laminate-900));
		border-top: 0.6cqi solid #000;
	}
	.slot {
		display: inline-flex;
		align-items: center;
		gap: 1.6cqi;
		padding: 1.4cqi 2.4cqi;
		border-radius: 0.8cqi;
		font-family: var(--font-pixel);
		font-size: 2.2cqi;
		color: #ff9b8f;
		background: linear-gradient(180deg, #2a2430, #121016);
		box-shadow:
			inset 0 0.2cqi 0 rgb(255 255 255 / 0.15),
			0 0.4cqi 0.6cqi rgb(0 0 0 / 0.6);
	}
</style>
