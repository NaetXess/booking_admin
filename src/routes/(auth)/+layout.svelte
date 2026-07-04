<script>
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="auth-wrapper">
	<div class="content">
		{@render children?.()}
	</div>
</div>

<style>
	.auth-wrapper {
		height: 100vh;
		overflow: hidden;
	}

	.auth-wrapper .content {
		height: 100%;
	}
</style>
