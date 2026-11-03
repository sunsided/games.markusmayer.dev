<script lang="ts">
	import { LINKS } from '#lib/site.js';
</script>

<footer class="site-footer">
	<p class="provenance">
		Every game here runs the exact build its repository released. The build is pinned by its SHA-256
		and carries a GitHub build attestation from that repository.
	</p>
	<div class="side">
		<p class="more">
			More of my work, and the writing, at <a href={LINKS.home}>markusmayer.dev</a>.
		</p>
		<nav class="legal" aria-label="Legal">
			<a href={LINKS.privacy}>Privacy</a>
			<a href={LINKS.imprint}>Imprint</a>
		</nav>
	</div>
</footer>

<style>
	.site-footer {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4) var(--space-7);
		justify-content: space-between;
		inline-size: min(var(--page-max), 100% - 2 * var(--gutter));
		margin: var(--space-9) auto 0;
		padding-block: var(--space-6) var(--space-7);
		border-top: 1px solid var(--color-line);
		font-size: var(--step--1);
		color: var(--color-text-muted);
	}
	.provenance {
		max-inline-size: 52ch;
	}
	.side {
		display: grid;
		gap: var(--space-3);
		justify-items: start;
	}
	@media (min-width: 48rem) {
		.side {
			justify-items: end;
			text-align: end;
		}
	}
	.legal {
		display: flex;
		gap: var(--space-5);
	}
</style>
