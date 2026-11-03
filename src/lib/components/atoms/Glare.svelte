<script lang="ts">
	/**
	 * The glare on a screen's glass, as on markusmayer.dev's CRT: a soft highlight where the
	 * mouse is and a faint foil sheen that turns with it. Fills its positioned parent and
	 * inherits its corners. Only for a mouse, only over the glass, and not while `off` (a game
	 * is being played). Watched from the window, since on the showroom floor the exhibit's
	 * link lies over the whole machine and the glass itself never sees the pointer.
	 */
	let { off = false }: { off?: boolean } = $props();

	let el: HTMLDivElement | undefined = $state();
	let lit = $state(false);
	let glare = $state({ x: 50, y: 30, turn: 0 });

	$effect(() => {
		if (!el || off || !matchMedia('(hover: hover)').matches) {
			lit = false;
			return;
		}
		const glass = el;
		let frame = 0;
		const move = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const r = glass.getBoundingClientRect();
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
	class="glare"
	class:lit
	style:--gx={`${glare.x}%`}
	style:--gy={`${glare.y}%`}
	style:--turn={`${glare.turn}rad`}
	aria-hidden="true"
	bind:this={el}
></div>

<style>
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
	.lit {
		opacity: 1;
	}
</style>
