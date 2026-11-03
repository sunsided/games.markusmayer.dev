<script lang="ts">
	/**
	 * The house badge: MM in pixel letters on a little plate. The same plate is moulded into
	 * the PC monitor's chin, so the site's mark and the hardware's maker are one.
	 */
	let { tone = 'light', size = '1rem' }: { tone?: 'light' | 'moulded'; size?: string } = $props();
</script>

<span class="monogram {tone}" style:font-size={size} aria-hidden="true">MM</span>

<style>
	.monogram {
		display: inline-grid;
		place-items: center;
		padding: 0.28em 0.42em 0.34em;
		font-family: var(--font-pixel);
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.06em;
		border-radius: 0.22em;
	}
	.light {
		color: var(--color-accent-ink);
		background: var(--color-accent);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.5),
			0 2px 0 color-mix(in oklab, var(--color-accent) 50%, #000);
	}
	/* Embossed into beige plastic: a shadow above, a highlight below. */
	.moulded {
		color: var(--beige-500);
		background: var(--beige-200);
		text-shadow:
			0 -1px 0 rgb(0 0 0 / 0.25),
			0 1px 0 rgb(255 255 255 / 0.7);
		box-shadow:
			inset 0 1px 1px rgb(0 0 0 / 0.18),
			0 1px 0 rgb(255 255 255 / 0.6);
	}
</style>
