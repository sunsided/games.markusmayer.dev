<script lang="ts">
	/**
	 * The Play key, laid over the front of a screen: interface, not picture, so it sits on top
	 * of the glass, sharp and unbent, untouched by scanlines, bulge and glare. The whole screen
	 * is the button; the pill in the middle says what it does.
	 */
	let { label, onclick }: { label: string; onclick: () => void } = $props();
</script>

<button type="button" class="play-key" {onclick}>
	<span class="pool" aria-hidden="true"></span>
	<span class="label">{label}</span>
</button>

<style>
	.play-key {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: inherit;
		background: transparent;
		cursor: pointer;
		pointer-events: auto;
	}
	.play-key:focus-visible {
		outline-offset: -4px;
	}
	/* A soft pool of shade behind the pill, so it reads on any title art. */
	.pool {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(
			circle at center,
			rgb(0 0 0 / 0.45) 0,
			rgb(0 0 0 / 0.15) 35%,
			transparent 60%
		);
		transition: background-color var(--dur-mid) var(--ease-out);
	}
	.label {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.6em;
		padding: 0.8em 1.4em 0.85em 1.15em;
		border-radius: var(--radius-pill);
		font-size: clamp(0.95rem, 0.7rem + 0.8vw, 1.2rem);
		font-weight: 700;
		font-stretch: var(--wdth-display);
		line-height: 1;
		color: var(--color-accent-ink);
		background: var(--color-accent);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.5),
			0 4px 0 color-mix(in oklab, var(--color-accent) 50%, #000),
			0 1.2rem 2.5rem rgb(0 0 0 / 0.6);
		transition: scale var(--dur-fast) var(--ease-snap);
	}
	.label::before {
		content: '';
		inline-size: 0;
		block-size: 0;
		border-block: 0.42em solid transparent;
		border-inline-start: 0.7em solid currentColor;
	}
	.play-key:hover .pool,
	.play-key:focus-visible .pool {
		background-color: rgb(0 0 0 / 0.12);
	}
	.play-key:hover .label,
	.play-key:focus-visible .label {
		scale: 1.06;
	}
	.play-key:active .label {
		scale: 0.98;
	}
</style>
