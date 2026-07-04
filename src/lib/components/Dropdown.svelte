<script>
	import { onMount } from 'svelte';

	/** @type {{dropup: any, id: any, children?: import('svelte').Snippet, menu?: import('svelte').Snippet}} */
	let {
		dropup,
		id,
		children,
		menu
	} = $props();

	let dropDirection = $state();

	onMount(() => {
		if (dropup) {
			dropDirection = 'dropup';
		}
	});
</script>

<div {id} class="dropdown {dropDirection}">
	{@render children?.()}
	<div class="dropdown-menu">
		{@render menu?.()}
	</div>
</div>
