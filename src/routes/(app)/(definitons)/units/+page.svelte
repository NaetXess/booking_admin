<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Resource } from '@controllers/resource';
	import { formatDate, getCookie, closeDropdown } from '@utils/function';
	import TableLoader from '@components/loaders/TableLoader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Badge from '@components/Badge.svelte';
	import Dropdown from '@components/Dropdown.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';

	let resources = $state([]);
	let loading = $state(false);

	// qu --> quick updatder variable
	let quActive = $state(1);

	// DELETE
	let showModal = $state(false);
	let selectedResource = $state();

	async function handleDeleteResource() {
		let res = await Resource.delete(selectedResource.id);
		if (res) {
			selectedResource = null;
			resources = resources.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	onMount(async () => {
		loading = true;

		let promises = [];

		promises.push(Resource.getAll());

		const [deptData] = await Promise.all(promises);
		resources = deptData;

		loading = false;
	});
</script>

<!-- <div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">Birimler</h5>
	<Button
		title="Yeni"
		primary
		on:click={() => {
			goto('/units/create/new');
		}}
	/>
</div> -->

<svelte:head>
	<title>Birimler | Xess Booking</title>
	<meta name="description" content="Şirketinize ait birimleri yönetin." />
</svelte:head>

<PageHeader
	title="Birimler"
	subTitle="Tüm birimlerinizi bu sayfadan yönetebilirsiniz."
	url="/units/create/new"
	btnTitle="Yeni Birim"
/>

<Card>
	<DataTable data={resources}>
		<table class="">
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
				{:else if resources && resources.length > 0}
					{#each resources as resource}
						<tr>
							<td><div class="bold">{resource.data.name}</div></td>
							<td><div class="text-center">{formatDate(resource.createdat, 9)}</div></td>
							<td>
								<div class="text-center">
									{#if resource.status == 0}
										<Badge danger>Pasif</Badge>
									{:else if resource.status == 1}
										<Badge primary>Aktif</Badge>
									{/if}
								</div>
							</td>
							<td>
								<div class="text-center">
									<Dropdown dropup id="quick-updater-dropdown-{resource.id}">
										{#if resource.active == 0}
											<Badge
												danger
												dropdown
												on:click={() => {
													quActive = 1;
												}}>Pasif</Badge
											>
										{:else if resource.active == 1}
											<Badge
												primary
												dropdown
												on:click={() => {
													quActive = 0;
												}}>Aktif</Badge
											>
										{/if}

										{#snippet menu()}
											<div>
												<div class="tools px-3">
													<button
														class="danger"
														onclick={() => {
															closeDropdown(`quick-updater-dropdown-${resource.id}`);
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
																onclick={() => {
																	quActive = 1;
																}}>Pasif</button
															>
														{:else if quActive == 1}
															<button
																class="active-status-selection primary"
																onclick={() => {
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
										{/snippet}
									</Dropdown>
								</div>
							</td>
							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn edit"
										onclick={() => goto(`/units/update/${resource.id}`)}
									>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn delete"
										onclick={() => {
											showModal = true;
											selectedResource = resource;
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
								Henüz kaynak bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>
<Modal bind:show={showModal} title="Kaynak Silme">
	<Confirmation
		text={`Kaynağı silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedResource = null;
		}}
		on:confirm={handleDeleteResource}
	/>
</Modal>

<style>
</style>
