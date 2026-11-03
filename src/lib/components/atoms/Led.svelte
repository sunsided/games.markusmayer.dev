<script lang="ts">
	/** An indicator lamp on a piece of hardware. Decoration: the state is told in words elsewhere. */
	let {
		color = 'green',
		on = true,
		size = '1em'
	}: { color?: 'green' | 'amber' | 'red'; on?: boolean; size?: string } = $props();
</script>

<span class="led {color}" class:on style:--size={size} aria-hidden="true"></span>

<style>
	.led {
		--lamp: var(--led-green);
		display: inline-block;
		inline-size: var(--size);
		block-size: var(--size);
		border-radius: 50%;
		background: radial-gradient(
			circle at 35% 30%,
			color-mix(in oklab, var(--lamp) 25%, #000) 0 30%,
			color-mix(in oklab, var(--lamp) 12%, #000) 70%
		);
		box-shadow:
			inset 0 0.08em 0.1em rgb(0 0 0 / 0.6),
			0 0.06em 0 rgb(255 255 255 / 0.35);
		transition:
			background var(--dur-mid) var(--ease-out),
			box-shadow var(--dur-mid) var(--ease-out);
	}
	.amber {
		--lamp: var(--led-amber);
	}
	.red {
		--lamp: var(--led-red);
	}
	.on {
		background: radial-gradient(
			circle at 35% 30%,
			#fff 0 12%,
			var(--lamp) 40%,
			color-mix(in oklab, var(--lamp) 55%, #000) 100%
		);
		box-shadow:
			0 0 0.4em var(--lamp),
			0 0 1.2em color-mix(in oklab, var(--lamp) 60%, transparent),
			0 0.06em 0 rgb(255 255 255 / 0.35);
	}
</style>
