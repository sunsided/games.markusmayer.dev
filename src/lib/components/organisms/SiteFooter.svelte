<footer class="site-footer">
	<p class="provenance">
		Every game here runs the exact build its repository released. The build is pinned by its SHA-256
		and carries a GitHub build attestation from that repository.
	</p>
	<p class="more">
		More of my work, and the writing, at <a href="https://markusmayer.dev/">markusmayer.dev</a>.
	</p>
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
</style>
