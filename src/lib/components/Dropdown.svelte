<script>
	import { onMount } from 'svelte';

	export let dropup;
	export let id;

	let dropDirection;

	onMount(() => {
		if (dropup) {
			dropDirection = 'dropup';
		}
	});
</script>

<div {id} class="dropdown {dropDirection}">
	<slot />
	<div class="dropdown-menu">
		<slot name="menu" />
	</div>
</div>
