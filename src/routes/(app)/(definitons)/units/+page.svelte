<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Bookable } from '@controllers/bookable';
	import { formatDate, getCookie, closeDropdown } from '@utils/function';
	import TableLoader from '@components/loaders/TableLoader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Badge from '@components/Badge.svelte';
	import Dropdown from '@components/Dropdown.svelte';

	let units = [];
	let loading = false;

	// qu --> quick updatder variable
	let quActive = 1;

	onMount(async () => {
		loading = true;

		let promises = [];

		promises.push(Bookable.getBookables({ company_id: getCookie('company_id') }));

		const [deptData] = await Promise.all(promises);
		units = deptData;

		loading = false;
	});
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">Birimler</h5>
	<Button
		title="Yeni"
		primary
		on:click={() => {
			goto('/units/create/new');
		}}
	/>
</div>

<Card>
	<DataTable pageCount="1">
		<table class="table table-hover">
			<thead>
				<tr>
					<th scope="col"><div class="p-2">Adı</div></th>
					<th scope="col"><div class="p-2 text-center">Oluşturulma Zamanı</div></th>
					<th scope="col"><div class="p-2 text-center">Durum</div></th>
					<th scope="col"><div class="p-2 text-center">Aktif</div></th>
					<th scope="col"></th>
				</tr>
			</thead>
			<tbody>
				{#if !loading && units.length > 0}
					{#each units as unit}
						<tr>
							<td><div class="p-2">{unit.name}</div></td>
							<td><div class="p-2 text-center">{formatDate(unit.createdat, 9)}</div></td>
							<td>
								<div class="p-2 text-center">
									{#if unit.status == 0}
										<Badge danger>Pasif</Badge>
									{:else if unit.status == 1}
										<Badge primary>Aktif</Badge>
									{/if}
								</div>
							</td>
							<td>
								<div class="p-2 text-center">
									<Dropdown dropup id="quick-updater-dropdown-{unit.id}">
										{#if unit.active == 0}
											<Badge
												danger
												dropdown
												on:click={() => {
													quActive = 1;
												}}>Pasif</Badge
											>
										{:else if unit.active == 1}
											<Badge
												primary
												dropdown
												on:click={() => {
													quActive = 0;
												}}>Aktif</Badge
											>
										{/if}

										<div slot="menu">
											<div class="tools px-3">
												<button
													class="danger"
													on:click={() => {
														closeDropdown(`quick-updater-dropdown-${unit.id}`);
													}}
												>
													<i class="bx bx-x"></i>
												</button>
												<button class="primary">
													<i class="bx bx-check"></i>
												</button>
											</div>

											<div class="body change-unit-active text-center mt-4 px-3">
												<div class="d-flex justify-content-center mb-3">
													{#if quActive == 0}
														<button
															class="active-status-selection danger"
															on:click={() => {
																quActive = 1;
															}}>Pasif</button
														>
													{:else if quActive == 1}
														<button
															class="active-status-selection primary"
															on:click={() => {
																quActive = 0;
															}}>Aktif</button
														>
													{/if}
												</div>

												<small class="info">
													*Bu kaydın aktiflik durumunu
													{#if quActive == 1}
														<span class="primary">aktif</span>
													{:else if quActive == 0}
														<span class="danger">pasif</span>
													{/if}
													olarak günceller.
												</small>
											</div>
										</div>
									</Dropdown>
								</div>
							</td>
							<td>
								<div class="p-2 table-row-tools">
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<i
										class="bx bx-edit-alt edit"
										on:click={() => {
											goto(`/units/update/${unit.id}`);
										}}
									></i>
									<i class="bx bx-trash delete"></i>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<!-- <TableLoader /> -->
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<style>
	.tools {
		display: flex;
		justify-content: end;
		gap: 10px;
	}
	.tools button {
		border: 0;
		width: 40px;
		height: 40px;
		font-size: 22px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
		transition: all ease 150ms;
	}

	.tools button.primary {
		color: rgb(25, 221, 25);
		background-color: rgb(204, 255, 204);
	}

	.tools button.danger {
		color: rgb(241, 40, 84);
		background-color: rgb(255, 213, 222);
	}

	.tools button:hover {
		transform: scale(1.05);
	}

	.change-unit-active .info {
		font-size: 12px;
	}
	button.active-status-selection {
		border: 0;
		background-color: red;
		width: 60%;
		padding: 3px 15px;
		border-radius: 4px;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
	}

	button.active-status-selection.danger {
		background-color: rgba(255, 110, 139, 0.25);
		color: #ff5a7b;
	}

	button.active-status-selection.primary {
		background-color: rgba(88, 180, 255, 0.25);
		color: rgb(69, 171, 255);
	}

	.info span {
		font-weight: bold;
	}

	.info span.primary {
		color: rgb(69, 171, 255);
	}

	.info span.danger {
		color: #ff5a7b;
	}
</style>
