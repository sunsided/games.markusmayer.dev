<script lang="ts">
	/** A SHA-256, shortened for reading, whole on hover and for copying. */
	let { value, length = 12 }: { value: string; length?: number } = $props();
</script>

<code class="hash" title={value}>{value.slice(0, length)}</code>

<style>
	.hash {
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-stretch: var(--wdth-tight);
		font-size: 0.95em;
		letter-spacing: 0.02em;
		color: var(--color-text);
	}
</style>
