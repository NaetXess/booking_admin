<script>
	import { onMount } from 'svelte';

	export let pageCount = 0;

	let paginationItems = [];

	onMount(() => {
		if (pageCount > 0) {
			paginationItems = Array.from({ length: pageCount }, (_, i) => i);
		}
	});
</script>

<div class="data-table">
	<div class="tools-wrapper px-4 pt-4">
		<div class="settings">
			<div class="table-filter">
				<span class="label">Sırala</span>
				<select name="" id="">
					<option value="">A - Z</option>
					<option value="">Z - A</option>
					<option value="">3</option>
				</select>
			</div>
			<div class="table-filter">
				<span class="label">Kayıt Sayısı </span>
				<select name="" id="">
					<option value="">25</option>
					<option value="">50</option>
					<option value="">75</option>
					<option value="">100</option>
				</select>
			</div>

			<div class="pagination">
				<span class="pagination-item"><i class="bx bx-left-arrow-alt"></i></span>

				{#if paginationItems.length > 0}
					{#each paginationItems as item}
						<span class="pagination-item active">{item + 1}</span>
					{/each}
				{/if}

				<span class="pagination-item"><i class="bx bx-right-arrow-alt"></i></span>
			</div>
		</div>
		<div class="search-bar my-3">
			<i class="bx bx-search-alt-2"></i>
			<input type="text" placeholder="Kayıt Arayın.." />
		</div>
	</div>
	<slot />
</div>

<style>
	.settings {
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: end;
		gap: 60px;
	}

	.label {
		color: rgb(150, 150, 150);
		font-size: 13px;
		font-weight: normal;
	}

	select {
		border: 1px solid rgb(200, 200, 200);
		border-radius: 8px;
		padding: 0px 5px;
		color: rgb(73, 73, 73);
	}

	.search-bar {
		height: 40px;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.search-bar i {
		font-size: 25px;
		color: rgb(150, 150, 150);
	}
	.search-bar input {
		border: none;
		outline: none;
		font-size: 16px;
		color: rgb(150, 150, 150);
		background-color: transparent;
	}

	.search-bar input::placeholder {
		color: rgb(150, 150, 150);
	}

	.pagination {
		display: flex;
		gap: 7px;
		align-items: center;
	}

	.pagination-item {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid rgb(200, 200, 200);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		color: rgb(150, 150, 150);
		cursor: pointer;
		box-shadow: 0 0 6px -2px rgba(0, 0, 0, 0.3);
		transition: transform ease 150ms;
	}

	.pagination-item:hover {
		transform: scale(1.05);
	}

	.pagination-item.active {
		background-color: rgba(245, 54, 92, 0.75);
		color: white;
		border: none;
	}

	.pagination-item i {
		font-size: 17px;
	}
</style>
