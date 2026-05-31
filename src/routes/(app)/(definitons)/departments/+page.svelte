<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Department } from '@controllers/department';
	import { formatDate } from '@utils/function';
	import TableLoader from '@components/loaders/TableLoader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Badge from '@components/Badge.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';

	let departments = [];
	let loading = false;

	// DELETE
	let showModal = false;
	let selectedDepartment;

	async function handleDeleteDepartment() {
		let res = await Department.delete(selectedDepartment.id);
		if (res) {
			selectedDepartment = null;
			departments = departments.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	onMount(async () => {
		loading = true;

		let promises = [];

		promises.push(Department.getByCompanyId('35d4e33a-ff60-46a8-b851-40ab33759422'));

		const [deptData] = await Promise.all(promises);
		departments = deptData;

		loading = false;
	});
</script>

<!-- <div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">Departmanlar</h5>
	<Button
		title="Yeni"
		primary
		on:click={() => {
			goto('/departments/create/new');
		}}
	/>
</div> -->

<svelte:head>
	<title>Randevular | Xess Booking</title>
	<meta name="description" content="Şirketinize ait departmanları yönetin." />
</svelte:head>

<PageHeader
	title="Departmanlar"
	subTitle="Tüm departmanlarınızı bu sayfadan yönetebilirsiniz."
	url="/departments/create/new"
	btnTitle="Yeni Departman"
/>

<Card>
	<DataTable data={departments}>
		<table class="">
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
				{:else if departments && departments.length > 0}
					{#each departments as department}
						<tr>
							<td><div class="bold">{department.name}</div></td>
							<td><div>{formatDate(department.createdat, 10)}</div></td>
							<td
								><div class="">
									{#if department.active == 0}
										<Badge danger>Pasif</Badge>
									{:else if department.active == 1}
										<Badge primary>Aktif</Badge>
									{/if}
								</div></td
							>
							<td
								><div class="">
									{#if department.active == 0}
										<Badge danger>Pasif</Badge>
									{:else if department.active == 1}
										<Badge primary>Aktif</Badge>
									{/if}
								</div></td
							>
							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span
										class="action-btn edit"
										on:click={() => goto(`/departments/update/${department.id}`)}
									>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span
										class="action-btn delete"
										on:click={() => {
											showModal = true;
											selectedDepartment = department;
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
								Henüz departman bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<Modal bind:show={showModal} title="Departman Silme">
	<Confirmation
		text={`Departmanı silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedDepartment = null;
		}}
		on:confirm={handleDeleteDepartment}
	/>
</Modal>

<style>
</style>
