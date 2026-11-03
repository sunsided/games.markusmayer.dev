<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<header>
	<a class="brand" href={resolve('/')}>
		<span class="prompt">C:\GAMES&gt;</span> games.markusmayer.dev
	</a>
	<a class="home" href="https://markusmayer.dev/">markusmayer.dev ↗</a>
</header>

<main>
	{@render children()}
</main>

<footer>
	<p>
		Every build here is the one its repository released, pinned by SHA-256 and checked for GitHub
		build provenance.
	</p>
</footer>

<style>
	:global {
		:root {
			--bg: #0b0d10;
			--panel: #14181d;
			--line: #262c34;
			--ink: #e6e8e3;
			--muted: #8a939e;
			--accent: #f5c542;
			--accent-ink: #0b0d10;
			--mono: ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Menlo, Consolas, monospace;
			--sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
			color-scheme: dark;
		}
		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}
		html {
			background: var(--bg);
			color: var(--ink);
			font: 16px/1.5 var(--sans);
		}
		body {
			margin: 0;
			min-height: 100dvh;
			display: flex;
			flex-direction: column;
		}
		a {
			color: inherit;
		}
		:focus-visible {
			outline: 2px solid var(--accent);
			outline-offset: 2px;
		}
	}

	header,
	main,
	footer {
		width: min(72rem, 100% - 2rem);
		margin-inline: auto;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		justify-content: space-between;
		align-items: baseline;
		padding-block: 1.25rem;
		border-bottom: 1px solid var(--line);
		font-family: var(--mono);
	}
	.brand {
		text-decoration: none;
		font-weight: 600;
	}
	.prompt {
		color: var(--accent);
	}
	.home {
		color: var(--muted);
		font-size: 0.875rem;
	}
	main {
		flex: 1;
		padding-block: 2rem;
	}
	footer {
		padding-block: 1.5rem;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.8125rem;
	}
	footer p {
		margin: 0;
	}
</style>
