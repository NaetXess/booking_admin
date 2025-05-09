<script>
	import { onMount } from 'svelte';

	export let id = '';
	export let title = '';

	export let primary;
	export let secondary;
	export let warning;
	export let danger;

	let backgroundColor;

	onMount(() => {
		if (primary) {
			backgroundColor = '#f46481';
		} else if (secondary) {
			backgroundColor = 'grey';
		} else if (warning) {
			backgroundColor = '#ff9966';
		} else if (danger) {
			backgroundColor = '#e63946';
		}
	});
</script>

<button {id} class="t-btn" on:click style="background-color: {backgroundColor};">{title}</button>

<style>
	.t-btn {
		padding: 5px 15px;
		border: 0;
		border-radius: 4px;
		color: white;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
		transition: all ease 150ms;
	}

	.t-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
	}
</style>
