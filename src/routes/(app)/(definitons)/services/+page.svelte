<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Service } from '@controllers/service';
	import { formatDate } from '@utils/function';
	import TableLoader from '@components/loaders/TableLoader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import Badge from '@components/Badge.svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';

	let services = $state([]);
	let loading = $state(false);

	// DELETE
	let showModal = $state(false);
	let selectedService = $state();

	async function handleDeleteService() {
		let res = await Service.delete(selectedService.id);
		if (res) {
			selectedService = null;
			services = services.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	onMount(async () => {
		loading = true;

		let promises = [];

		promises.push(Service.getByCompanyId());

		const [serviceData] = await Promise.all(promises);
		services = serviceData;

		loading = false;
	});
</script>

<!-- <div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">Hizmetler</h5>
	<Button
		title="Yeni"
		primary
		on:click={() => {
			goto('/services/create/new');
		}}
	/>
</div> -->

<svelte:head>
	<title>Hizmetler | Xess Booking</title>
	<meta name="description" content="Şirketinize ait hizmetleri yönetin." />
</svelte:head>

<PageHeader
	title="Hizmetler"
	subTitle="Tüm hizmetlerinizi bu sayfadan yönetebilirsiniz."
	url="/services/create/new"
	btnTitle="Yeni Hizmet"
/>

<Card>
	<DataTable data={services}>
		<table class="">
			<thead>
				<tr>
					<th>Adı</th>
					<th>Oluşturulma Zamanı</th>
					<th>Aktif</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#if loading}
					<tr>
						<td colspan="7" style="padding: 0;">
							<div class="empty-row">
								<!-- İçindeki div flex oldu -->
								<i class="bx bx-loader-alt bx-spin"></i>
								Yükleniyor…
							</div>
						</td>
					</tr>
				{:else if services && services.length > 0}
					{#each services as service}
						<tr>
							<td><div class="bold">{service.name}</div></td>
							<td><div class="">{formatDate(service.createdat, 9)}</div></td>

							<td
								><div class="">
									{#if service.active == 0}
										<Badge danger>Pasif</Badge>
									{:else if service.active == 1}
										<Badge primary>Aktif</Badge>
									{/if}
								</div></td
							>
							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn edit"
										onclick={() => goto(`services/update/${service.id}`)}
									>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn delete"
										onclick={() => {
											showModal = true;
											selectedService = service;
										}}
									>
										<i class="bx bx-trash"></i>
									</span>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="7" style="padding: 0;">
							<div class="empty-row">
								<i class="bx bx-calendar-x"></i>
								Henüz servis bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<Modal bind:show={showModal} title="Servis Silme">
	<Confirmation
		text={`Servisi silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedService = null;
		}}
		on:confirm={handleDeleteService}
	/>
</Modal>

<style>
</style>
