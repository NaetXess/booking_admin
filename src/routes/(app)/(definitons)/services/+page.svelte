<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Service } from '@controllers/service';
	import { formatDate } from '@utils/function';
	import TableLoader from '@components/loaders/TableLoader.svelte';
	import DataTable from '@components/DataTable.svelte';

	let services = [];
	let loading = false;

	onMount(async () => {
		loading = true;

		let promises = [];

		promises.push(Service.getByCompanyId('35d4e33a-ff60-46a8-b851-40ab33759422'));

		const [serviceData] = await Promise.all(promises);
		services = serviceData;

		loading = false;
	});
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">Hizmetler</h5>
	<Button
		title="Yeni"
		primary
		on:click={() => {
			goto('/services/create/new');
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
				{#if !loading && services.length > 0}
					{#each services as service}
						<tr>
							<td><div class="p-2">{service.name}</div></td>
							<td><div class="p-2">{formatDate(service.createdat, 6)}</div></td>
							<td><div class="p-2">{service.status}</div></td>
							<td><div class="p-2">{service.active}</div></td>
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
