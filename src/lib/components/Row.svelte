<script>
	/** @type {{classes: any, children?: import('svelte').Snippet}} */
	let { classes, children } = $props();
</script>

<div class="row {classes ? classes : ''}">
	{@render children?.()}
</div>
