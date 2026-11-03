<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface Spec {
		term: string;
		detail: string | Snippet;
	}

	/** The spec sheet: terms on the left, values on the right, a hairline between rows. */
	let { items }: { items: Spec[] } = $props();
</script>

<dl class="specs">
	{#each items as item (item.term)}
		<div class="row">
			<dt>{item.term}</dt>
			<dd>
				{#if typeof item.detail === 'string'}{item.detail}{:else}{@render item.detail()}{/if}
			</dd>
		</div>
	{/each}
</dl>

<style>
	.specs {
		margin: 0;
		font-size: var(--step--1);
	}
	.row {
		display: grid;
		grid-template-columns: 8.5rem 1fr;
		gap: var(--space-4);
		padding-block: var(--space-3);
		border-top: 1px solid var(--color-line);
	}
	.row:last-child {
		border-bottom: 1px solid var(--color-line);
	}
	dt {
		color: var(--color-text-muted);
	}
	dd {
		margin: 0;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
</style>
