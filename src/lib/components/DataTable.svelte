<script>
	import { createEventDispatcher, onMount } from 'svelte';
	export let data;
	export let sortingItems = [];

	let pageSize = 10;
	let page = 1;
	let sortingParam = 'createdat:desc';
	let sort = 'createdat';
	let order = 'desc';

	let searchText;
	const dispatch = createEventDispatcher();

	function handleSearch(e) {
		dispatch('search', { search_text: searchText });
	}

	function handlePagination({ page: newPage, action }) {
		let oldPage = page;
		if (newPage) {
			page = newPage;
		} else if (action === 'next') {
			page = Math.min(page + 1, data?.total_pages);
		} else if (action === 'prev') {
			page = Math.max(page - 1, 1);
		}
		if (oldPage == page) {
			return;
		} else {
			dispatch('pagination', { page, page_size: pageSize });
		}
	}

	$: handlePageSize(pageSize);

	function handlePageSize(newPageSize) {
		dispatch('pageSize', {
			page,
			page_size: newPageSize
		});
	}

	$: handleSort(sortingParam);

	function handleSort(_params) {
		const [newSort, newOrder] = (_params || '').split(':');

		const oldSort = sort;
		const oldOrder = order;

		if (!newSort || !newOrder) return;

		sort = newSort;
		order = newOrder;

		if (oldSort != sort || oldOrder != order) {
			dispatch('sort', {
				order,
				sort
			});
		}
	}
</script>

<!-- Table Card -->
<div class="table-card">
	<!-- Toolbar -->
	<div class="toolbar">
		<div class="search-box">
			<i class="bx bx-search"></i>
			<input
				type="text"
				placeholder="İsim, telefon veya hizmet ara…"
				bind:value={searchText}
				on:input={handleSearch}
			/>
		</div>
		<div class="toolbar-right">
			<div class="filter-group">
				<label for="">Sırala</label>
				<select bind:value={sortingParam}>
					{#if sortingItems.length > 0}
						{#each sortingItems as item}
							<option id={item.id} value={item.value}>{item.name}</option>
						{/each}
					{/if}
				</select>
			</div>
			<div class="filter-group">
				<label for="">Sayfa başı</label>
				<select bind:value={pageSize}>
					<option value={10}>10</option>
					<option value={25}>25</option>
					<option value={50}>50</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Table -->
	<div class="table-wrapper">
		<slot />
	</div>

	<!-- Pagination -->
	<div class="table-footer">
		<span class="record-info">
			{#if data}
				{#if data.page == 0 && data.limit == 0}
					Toplam <strong>{data.total_rows}</strong> kayıt bulundu
				{:else}
					Toplam <strong>{data.total_rows}</strong> kayıt'tan

					<strong>
						{(page - 1) * data.limit + 1}
						-
						{page * data.limit > data.total_rows ? data.total_rows : page * data.limit}
					</strong>

					gösteriliyor
				{/if}
			{/if}
		</span>
		<div class="pagination">
			{#if data && data?.total_pages > 0}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<span
					class="page-btn"
					on:click={() => {
						handlePagination({ action: 'prev' });
					}}><i class="bx bx-left-arrow-alt"></i></span
				>
				{#each Array(data.total_pages) as _, i}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span
						on:click={() => {
							handlePagination({ page: i + 1 });
						}}
						class="page-btn {page == i + 1 ? 'active' : ''}">{i + 1}</span
					>
				{/each}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<span
					class="page-btn"
					on:click={() => {
						handlePagination({ action: 'next' });
					}}><i class="bx bx-right-arrow-alt"></i></span
				>
			{/if}
		</div>
	</div>
</div>

<style>
	/* ─── Card Shell ──────────────────────────────────────────── */
	.table-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #f0f2f5;
		gap: 12px;
		flex-wrap: wrap;
	}
	.search-box {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #f7f8fa;
		border: 1.5px solid #ebedf0;
		border-radius: 8px;
		padding: 8px 14px;
		flex: 1;
		max-width: 360px;
		transition: border-color 150ms;
	}
	.search-box:focus-within {
		border-color: #f5365c;
	}
	.search-box i {
		font-size: 18px;
		color: #b0b8c4;
		flex-shrink: 0;
	}
	.search-box input {
		border: none;
		outline: none;
		background: transparent;
		font-size: 13px;
		color: #445471;
		width: 100%;
	}
	.search-box input::placeholder {
		color: #b0b8c4;
	}
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.filter-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.filter-group label {
		font-size: 12px;
		color: #9aa3b0;
		white-space: nowrap;
	}
	.filter-group select {
		border: 1.5px solid #ebedf0;
		border-radius: 7px;
		padding: 6px 10px;
		font-size: 13px;
		color: #445471;
		background: #f7f8fa;
		cursor: pointer;
		outline: none;
		transition: border-color 150ms;
	}
	.filter-group select:focus {
		border-color: #f5365c;
	}

	/* ─── Table ───────────────────────────────────────────────── */
	.table-wrapper {
		overflow-x: auto;
	}

	/* ─── Footer / Pagination ─────────────────────────────────── */
	.table-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 20px;
		border-top: 1px solid #f0f2f5;
		flex-wrap: wrap;
		gap: 10px;
	}
	.record-info {
		font-size: 13px;
		color: #9aa3b0;
	}
	.record-info strong {
		color: #445471;
	}
	.pagination {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.page-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 1.5px solid #ebedf0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 13px;
		color: #7a8699;
		cursor: pointer;
		transition: all 150ms ease;
		font-weight: 500;
	}
	.page-btn:hover {
		border-color: #f5365c;
		color: #f5365c;
	}
	.page-btn.active {
		background: #f5365c;
		color: white;
		border-color: #f5365c;
		box-shadow: 0 2px 8px rgba(245, 54, 92, 0.35);
	}
	.page-btn i {
		font-size: 16px;
	}
</style>
