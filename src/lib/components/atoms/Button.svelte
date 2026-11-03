<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The one button. `primary` is the amber key you press; `quiet` sits beside it.
	 * Renders a link when given `href`, a button otherwise.
	 */
	let {
		href,
		variant = 'primary',
		type = 'button',
		onclick,
		children,
		...rest
	}: {
		href?: string;
		variant?: 'primary' | 'quiet';
		type?: 'button' | 'submit';
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

{#if href}
	<a class="button {variant}" {href} {...rest}>{@render children()}</a>
{:else}
	<button class="button {variant}" {type} {onclick} {...rest}>{@render children()}</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0.7em 1.25em 0.75em;
		border: 0;
		border-radius: var(--radius-pill);
		font: inherit;
		font-size: var(--step-0);
		font-weight: 650;
		font-stretch: var(--wdth-display);
		line-height: 1;
		letter-spacing: -0.005em;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			translate var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}
	/* A physical key: a lip underneath that it travels into when pressed. */
	.primary {
		color: var(--color-accent-ink);
		background: var(--color-accent);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.45),
			0 3px 0 color-mix(in oklab, var(--color-accent) 55%, #000),
			0 0.75rem 1.5rem -0.5rem color-mix(in oklab, var(--color-accent) 60%, transparent);
	}
	.primary:hover {
		background: var(--color-accent-hover);
	}
	.primary:active {
		translate: 0 2px;
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.45),
			0 1px 0 color-mix(in oklab, var(--color-accent) 55%, #000);
	}
	.quiet {
		color: var(--color-text);
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--color-line);
	}
	.quiet:hover {
		box-shadow: inset 0 0 0 1px var(--color-text-muted);
	}
	.quiet:active {
		translate: 0 1px;
	}
</style>
