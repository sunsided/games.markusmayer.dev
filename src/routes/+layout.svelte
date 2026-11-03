<script lang="ts">
	import '@fontsource-variable/archivo/wdth.css';
	import '@fontsource/silkscreen/400.css';
	import '@fontsource/silkscreen/700.css';
	import '#lib/design/tokens.css';
	import '#lib/design/base.css';
	import SiteFooter from '#lib/components/organisms/SiteFooter.svelte';
	import SiteHeader from '#lib/components/organisms/SiteHeader.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<SiteHeader />
<main>
	{@render children()}
</main>
<SiteFooter />

<style>
	main {
		inline-size: min(var(--page-max), 100% - 2 * var(--gutter));
		margin-inline: auto;
	}
</style>
