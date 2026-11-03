<script lang="ts">
	/**
	 * The kaleidoscope: two rings of rays, counter-rotating so they interfere, after
	 * synthie-trombone's GitHub mark. Folded to a point and still until its parent opens it,
	 * by setting `--burst-open: 1` (on hover, say); then it unfolds and spins. Decorative and
	 * pointer-transparent. Colours from `--ray-a` … `--ray-d`, size from `size`.
	 */
	let { size = 'min(90vmin, 60rem)' }: { size?: string } = $props();
</script>

<span class="ray-burst" style:--burst-size={size} aria-hidden="true"></span>

<style>
	.ray-burst {
		--a: var(--ray-a, #00f0ff);
		--b: var(--ray-b, #a85cff);
		--c: var(--ray-c, #ff2eaa);
		--d: var(--ray-d, #ff8c28);
		position: absolute;
		left: 50%;
		top: 50%;
		z-index: -1;
		inline-size: var(--burst-size);
		block-size: var(--burst-size);
		translate: -50% -50%;
		pointer-events: none;
		/* Closed: a speck, turned back. Open: full size and upright. */
		opacity: var(--burst-open, 0);
		scale: calc(0.04 + 0.96 * var(--burst-open, 0));
		rotate: calc(-90deg + 90deg * var(--burst-open, 0));
		transition:
			opacity 260ms var(--ease-out),
			scale 700ms var(--ease-snap),
			rotate 700ms var(--ease-snap);
	}
	.ray-burst::before,
	.ray-burst::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		animation: spin 9s linear infinite;
		animation-play-state: var(--burst-play, paused);
	}
	.ray-burst::before {
		background: repeating-conic-gradient(
			from 0deg,
			var(--a) 0deg 1.4deg,
			transparent 1.4deg 7.5deg,
			var(--b) 7.5deg 8.9deg,
			transparent 8.9deg 15deg,
			var(--c) 15deg 16.4deg,
			transparent 16.4deg 22.5deg,
			var(--d) 22.5deg 23.9deg,
			transparent 23.9deg 30deg
		);
		mask: radial-gradient(circle, transparent 3%, #000 6%, #000 38%, transparent 70%);
		opacity: 0.85;
	}
	.ray-burst::after {
		background: repeating-conic-gradient(
			from 3deg,
			var(--d) 0deg 0.8deg,
			transparent 0.8deg 4deg,
			var(--a) 4deg 4.8deg,
			transparent 4.8deg 8deg,
			var(--c) 8deg 8.8deg,
			transparent 8.8deg 12deg,
			var(--b) 12deg 12.8deg,
			transparent 12.8deg 16deg
		);
		mask: radial-gradient(circle, transparent 5%, #000 10%, #000 30%, transparent 62%);
		mix-blend-mode: screen;
		opacity: 0.7;
		animation-name: spin-back;
		animation-duration: 6s;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
	@keyframes spin-back {
		to {
			rotate: -360deg;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ray-burst::before,
		.ray-burst::after {
			animation: none;
		}
	}
</style>
