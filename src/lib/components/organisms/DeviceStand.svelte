<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * For a game that draws its own hardware, a handheld say: no machine around it, only the
	 * object itself, propped on a clear acrylic display easel like an exhibit in a case. No
	 * CRT layers either: an LCD has no scanlines and no bulge.
	 */
	let {
		aspect = '5 / 3',
		screen,
		front
	}: { aspect?: string; screen: Snippet; front?: Snippet } = $props();
</script>

<div class="device">
	<div class="object" style:aspect-ratio={aspect}>
		<div class="face">{@render screen()}</div>
		<div class="sheen" aria-hidden="true"></div>
		{#if front}<div class="front">{@render front()}</div>{/if}
	</div>
	<div class="easel" aria-hidden="true">
		<span class="lip"></span>
		<span class="foot left"></span>
		<span class="foot right"></span>
	</div>
</div>

<style>
	.device {
		container-type: inline-size;
		position: relative;
	}
	.object {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		/* Rounded like the moulded case the game draws. */
		border-radius: 2.4cqi;
		background: #000;
		box-shadow:
			0 0 0 1px rgb(0 0 0 / 0.5),
			0 0 4rem -1rem color-mix(in oklab, var(--game-accent) 45%, transparent),
			var(--shadow-object);
	}
	.face,
	.front {
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.face > :global(*) {
		inline-size: 100%;
		block-size: 100%;
	}
	.front {
		pointer-events: none;
	}
	/* The room's light on the plastic, faint and fixed. */
	.sheen {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		background: linear-gradient(
			160deg,
			rgb(255 255 255 / 0.1) 0%,
			rgb(255 255 255 / 0.03) 25%,
			transparent 45%
		);
	}

	/* The easel: a clear lip the object rests on, and two feet, all catching edge light. */
	.easel {
		position: relative;
		block-size: 5cqi;
	}
	.lip {
		position: absolute;
		inset-inline: -2cqi;
		top: -1.4cqi;
		block-size: 2.2cqi;
		border-radius: 0.6cqi;
		background: linear-gradient(
			180deg,
			rgb(255 255 255 / 0.35),
			rgb(255 255 255 / 0.08) 40%,
			rgb(255 255 255 / 0.16)
		);
		box-shadow:
			inset 0 0.15cqi 0 rgb(255 255 255 / 0.55),
			0 0.8cqi 1.6cqi rgb(0 0 0 / 0.35);
		backdrop-filter: blur(2px);
	}
	.foot {
		position: absolute;
		top: 0.8cqi;
		inline-size: 12cqi;
		block-size: 4cqi;
		background: linear-gradient(180deg, rgb(255 255 255 / 0.18), rgb(255 255 255 / 0.04));
		clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
	}
	.foot.left {
		left: 12%;
	}
	.foot.right {
		right: 12%;
	}
</style>
