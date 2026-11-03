<script lang="ts">
	import type { Snippet } from 'svelte';
	import Led from '../atoms/Led.svelte';
	import Monogram from '../atoms/Monogram.svelte';

	/**
	 * A beige VGA monitor of about 1990: moulded case, a dark recess around the tube, a chin
	 * with the maker's badge, vents, two knobs, a power lamp and a button, on a swivel stand.
	 * Everything is drawn in CSS and sized in container units, so it scales as one object.
	 */
	let {
		on = true,
		stand = true,
		screen
	}: { on?: boolean; stand?: boolean; screen: Snippet } = $props();
</script>

<div class="pc">
	<div class="case">
		<div class="recess">
			{@render screen()}
		</div>
		<div class="chin" aria-hidden="true">
			<span class="badge"><Monogram tone="moulded" size="2.1cqi" /><span>VGA</span></span>
			<span class="vents"></span>
			<span class="controls">
				<span class="knob"></span>
				<span class="knob"></span>
				<Led color={on ? 'green' : 'amber'} size="1.5cqi" />
				<span class="power"></span>
			</span>
		</div>
	</div>
	{#if stand}
		<div class="neck" aria-hidden="true"></div>
		<div class="base" aria-hidden="true"></div>
	{/if}
</div>

<style>
	.pc {
		container-type: inline-size;
		position: relative;
	}

	.case {
		position: relative;
		padding: 5cqi 5.5cqi 11.5cqi;
		border-radius: 3.4cqi 3.4cqi 2.6cqi 2.6cqi;
		background:
			radial-gradient(120% 60% at 50% 0%, rgb(255 255 255 / 0.35), transparent 60%),
			linear-gradient(
				180deg,
				var(--beige-100) 0%,
				var(--beige-200) 28%,
				var(--beige-300) 82%,
				var(--beige-500) 100%
			);
		box-shadow:
			inset 0 0.35cqi 0 rgb(255 255 255 / 0.75),
			inset 0.35cqi 0 0 rgb(255 255 255 / 0.3),
			inset -0.35cqi 0 0 rgb(0 0 0 / 0.08),
			inset 0 -0.7cqi 0 rgb(0 0 0 / 0.16),
			var(--shadow-object);
	}

	/* The dark frame the tube sits in, its top edge in shadow and bottom lip catching light. */
	.recess {
		padding: 2.4cqi;
		border-radius: 2.8cqi;
		background: linear-gradient(180deg, #1c1915, var(--recess) 40%, #3a352d);
		box-shadow:
			inset 0 0.9cqi 1.6cqi rgb(0 0 0 / 0.75),
			inset 0 -0.2cqi 0 rgb(255 255 255 / 0.08),
			0 0.35cqi 0 rgb(255 255 255 / 0.65),
			0 -0.25cqi 0 rgb(0 0 0 / 0.12);
	}

	.chin {
		position: absolute;
		inset-inline: 5.5cqi;
		bottom: 2.4cqi;
		block-size: 7cqi;
		display: flex;
		align-items: center;
		gap: 3cqi;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 1cqi;
		font-family: var(--font-pixel);
		font-size: 1.9cqi;
		color: var(--beige-500);
		text-shadow:
			0 -1px 0 rgb(0 0 0 / 0.22),
			0 1px 0 rgb(255 255 255 / 0.7);
	}
	.vents {
		flex: 1;
		block-size: 2.2cqi;
		max-inline-size: 22cqi;
		border-radius: 1cqi;
		background: repeating-linear-gradient(
			90deg,
			var(--beige-500) 0 0.45cqi,
			rgb(0 0 0 / 0.35) 0.45cqi 0.7cqi,
			transparent 0.7cqi 1.5cqi
		);
		opacity: 0.55;
	}
	.controls {
		margin-inline-start: auto;
		display: inline-flex;
		align-items: center;
		gap: 2cqi;
	}
	.knob {
		inline-size: 2.6cqi;
		block-size: 2.6cqi;
		border-radius: 50%;
		background: radial-gradient(circle at 40% 35%, var(--beige-100), var(--beige-300) 60%);
		box-shadow:
			0 0.25cqi 0.35cqi rgb(0 0 0 / 0.35),
			inset 0 -0.2cqi 0 rgb(0 0 0 / 0.15);
	}
	.power {
		inline-size: 5cqi;
		block-size: 2.8cqi;
		border-radius: 0.6cqi;
		background: linear-gradient(180deg, var(--beige-200), var(--beige-300));
		box-shadow:
			inset 0 0.2cqi 0 rgb(255 255 255 / 0.7),
			0 0.2cqi 0 var(--beige-500),
			0 0.45cqi 0.6cqi rgb(0 0 0 / 0.3);
	}

	/* Swivel stand: a short neck and an oval foot. */
	.neck {
		margin-inline: auto;
		inline-size: 26%;
		block-size: 4.5cqi;
		background: linear-gradient(180deg, var(--beige-500), var(--beige-300) 35%, var(--beige-500));
		clip-path: polygon(14% 0, 86% 0, 100% 100%, 0 100%);
	}
	.base {
		margin-inline: auto;
		inline-size: 48%;
		block-size: 3.4cqi;
		border-radius: 50% / 40% 40% 60% 60%;
		background: linear-gradient(180deg, var(--beige-200), var(--beige-300) 50%, var(--beige-500));
		box-shadow:
			inset 0 0.3cqi 0 rgb(255 255 255 / 0.6),
			0 1.5cqi 2.5cqi -0.5cqi rgb(0 0 0 / 0.6);
	}
</style>
