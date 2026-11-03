<script lang="ts">
	import { liquidGlass } from '@sunsided/web-visual-fx';
	import { LensFilter } from '@sunsided/web-visual-fx/svelte';
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
		children,
		front
	}: {
		aspect?: string;
		power?: boolean;
		delay?: number;
		live?: boolean;
		children: Snippet;
		/** Interface laid over the glass (the Play key): not bent, lined or glared. */
		front?: Snippet;
	} = $props();

	const uid = $props.id();
	let tube: HTMLDivElement | undefined = $state();
	let w = $state(0);
	let h = $state(0);

	/*
		The bulge. A CRT's face is convex, so the picture bends toward its edges. web-visual-fx's
		liquid glass computes exactly that kind of displacement for a curved bezel; applied to
		the picture rather than the backdrop, it bends the image the way the tube does, with
		chromatic aberration at the rim: red bent a little more than green, blue a little less. Not while a game runs: it would distort play and
		misplace clicks, and the games bring their own curvature.
	*/
	const lens = $derived.by(() => {
		if (!w || !h || typeof document === 'undefined') return undefined;
		const short = Math.min(w, h);
		const shape = {
			width: Math.round(w),
			height: Math.round(h),
			radius: short * 0.08,
			bezel: short * 0.2,
			profile: 'circle' as const
		};
		const canvas = document.createElement('canvas');
		canvas.width = shape.width;
		canvas.height = shape.height;
		const data = liquidGlass.displacementMap(shape);
		canvas.getContext('2d')?.putImageData(new ImageData(data, shape.width, shape.height), 0, 0);
		return { ...shape, map: canvas.toDataURL('image/png'), refraction: short * 0.04 };
	});

	/*
		The glare on the glass, as on markusmayer.dev's CRT: a soft highlight where the mouse is
		and a faint foil sheen that turns with it. Only for a mouse, only over the tube, and
		not while playing. Watched from the window, since on the showroom floor the exhibit's
		link lies over the whole machine and the tube itself never sees the pointer.
	*/
	let lit = $state(false);
	let glare = $state({ x: 50, y: 30, turn: 0 });
	$effect(() => {
		if (!tube || live || !matchMedia('(hover: hover)').matches) {
			lit = false;
			return;
		}
		let frame = 0;
		const move = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const r = tube!.getBoundingClientRect();
				const x = (e.clientX - r.left) / r.width;
				const y = (e.clientY - r.top) / r.height;
				lit = x >= 0 && x <= 1 && y >= 0 && y <= 1;
				if (lit) glare = { x: x * 100, y: y * 100, turn: Math.atan2(y - 0.5, x - 0.5) };
			});
		};
		const leave = () => (lit = false);
		window.addEventListener('pointermove', move, { passive: true });
		document.documentElement.addEventListener('pointerleave', leave);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', move);
			document.documentElement.removeEventListener('pointerleave', leave);
		};
	});
</script>

<div
	class="crt"
	class:live
	class:lit
	style:aspect-ratio={aspect}
	style:--gx={`${glare.x}%`}
	style:--gy={`${glare.y}%`}
	style:--turn={`${glare.turn}rad`}
	bind:this={tube}
	bind:clientWidth={w}
	bind:clientHeight={h}
>
	<div class="picture" class:power style:--delay={`${delay}ms`}>
		<div class="lens" style:filter={lens && !live ? `url(#${uid}-bulge)` : undefined}>
			{@render children()}
		</div>
	</div>
	<div class="mask" aria-hidden="true"></div>
	<div class="glass" aria-hidden="true"></div>
	<div class="glare" aria-hidden="true"></div>
	{#if front}<div class="front">{@render front()}</div>{/if}
	{#if lens}
		<svg class="defs" width="0" height="0" aria-hidden="true">
			<LensFilter
				id={`${uid}-bulge`}
				width={lens.width}
				height={lens.height}
				map={lens.map}
				refraction={lens.refraction}
				fringe={0.5}
				bezel={lens.bezel}
				specular={0}
			/>
		</svg>
	{/if}
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
	/* The bulge's filter sits here, inside the picture: the switch-on animation's own filter
	   on .picture would otherwise replace it, and keep replacing it once it has ended. */
	.lens {
		position: absolute;
		inset: 0;
	}
	.lens > :global(*) {
		inline-size: 100%;
		block-size: 100%;
	}
	.defs {
		position: absolute;
		inline-size: 0;
		block-size: 0;
		overflow: hidden;
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

	.front {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
	}

	/* The glare, lit while the mouse is over the glass. */
	.glare {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		opacity: 0;
		background:
			radial-gradient(
				circle at var(--gx) var(--gy),
				rgb(255 255 255 / 0.34) 0%,
				rgb(255 255 255 / 0.12) 16%,
				rgb(255 255 255 / 0.03) 32%,
				transparent 50%
			),
			conic-gradient(
				from var(--turn) at 50% 50%,
				rgb(255 120 200 / 0.13),
				rgb(120 200 255 / 0.13),
				rgb(160 255 170 / 0.11),
				rgb(255 230 120 / 0.13),
				rgb(255 120 200 / 0.13)
			);
		mix-blend-mode: screen;
		transition: opacity var(--dur-mid) var(--ease-out);
	}
	.lit .glare {
		opacity: 1;
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
