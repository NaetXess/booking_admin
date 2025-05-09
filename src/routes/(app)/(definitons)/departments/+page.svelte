<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Department } from '@controllers/department';
	import { formatDate } from '@utils/function';
	import TableLoader from '@components/loaders/TableLoader.svelte';
	import DataTable from '@components/DataTable.svelte';

	let departments = [];
	let loading = false;

	onMount(async () => {
		loading = true;

		let promises = [];

		promises.push(Department.getByCompanyId('35d4e33a-ff60-46a8-b851-40ab33759422'));

		const [deptData] = await Promise.all(promises);
		departments = deptData;

		loading = false;
	});
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">Departmanlar</h5>
	<Button
		title="Yeni"
		primary
		on:click={() => {
			goto('/departments/create/new');
		}}
	/>
</div>

<Card>
	<DataTable pageCount="1">
		<table class="table table-hover">
			<thead>
				<tr>
					<th scope="col"><div class="p-2">Adı</div></th>
					<th scope="col"><div class="p-2">Oluşturulma Zamanı</div></th>
					<th scope="col"><div class="p-2">Durum</div></th>
					<th scope="col"><div class="p-2">Aktif</div></th>
					<th scope="col"></th>
				</tr>
			</thead>
			<tbody>
				{#if !loading && departments.length > 0}
					{#each departments as department}
						<tr>
							<td><div class="p-2">{department.name}</div></td>
							<td><div class="p-2">{formatDate(department.createdat, 6)}</div></td>
							<td><div class="p-2">{department.status}</div></td>
							<td><div class="p-2">{department.active}</div></td>
							<td>
								<div class="p-2 table-row-tools">
									<i class="bx bx-edit-alt edit"></i>
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
</style>
