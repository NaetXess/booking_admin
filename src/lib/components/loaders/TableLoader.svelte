<script>
	import { onMount } from 'svelte';

	export let rowCount = 6;
	export let colCount = 5;

	let rows = [];
	let cols = [];

	onMount(() => {
		if (rowCount <= 0) {
			rowCount = 6;
		}

		if (colCount <= 0) {
			colCount = 6;
		}

		for (let i = 0; i < rowCount; i++) {
			rows.push(i);
		}

		for (let i = 0; i < colCount; i++) {
			cols.push(i);
		}

		rows = rows;
		cols = cols;
	});
</script>

{#each rows as row}
	<tr>
		{#each cols as column}
			<td></td>
		{/each}
		<div class="loader"></div>
	</tr>
{/each}

<style>
	tr {
		position: relative;
		overflow: hidden;
		width: 100%;
	}

	td {
		padding: 1.25rem;
	}

	.loader {
		position: absolute;
		top: 0px;
		left: 0;
		width: 20px;
		height: 60px;
		background-color: rgb(190, 190, 190);
		transform: rotate(15deg);
		animation: linear 3s loading-anim infinite;
	}

	@keyframes loading-anim {
		from {
			left: 0;
		}
		to {
			left: 100%;
		}
	}
</style>
