<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Bookable } from '@controllers/bookable';
	import { Department } from '@controllers/department';
	import { getCookie } from '@utils/function';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import Button from '@components/Button.svelte';

	let isUpdate = 0;
	let pageTitle;

	let name;
	let departmentId;
	let status = 1;
	let active = 1;

	let departments = [];

	async function handleDBOperations() {
		let obj = {
			name,
			department_id: departmentId,
			status: Number(status),
			active: Number(active),
			company_id: getCookie('company_id'),
			user_id: getCookie('user_id')
		};

		let res = await Bookable.create(obj);

		if (res) {
			goto('/units');
		}
	}

	onMount(async () => {
		if ($page.params.page == 'create') {
			pageTitle = 'Birim Oluştur';
		} else if ($page.params.page == 'update') {
			isUpdate = 1;
			pageTitle = 'Birimi Düzenle';
		} else {
			goto('/units');
		}

		departments = await Department.getByCompanyId('35d4e33a-ff60-46a8-b851-40ab33759422');
		if (departments) {
			departmentId = departments[0].id;
		}

		if (isUpdate && $page.params.id) {
			let res = await Bookable.getBookableById($page.params.id);
			if (res) {
				res = res[0];

				name = res.name;
				departmentId = res.departmentId;
				status = res.status;
				active = res.active;
			}
		}
	});
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">{pageTitle}</h5>
</div>

<Card>
	<div class="body-wrapper p-4">
		<div class="header mb-5">
			<h4>Birim</h4>
		</div>
		<Row>
			<Col width="6">
				<label for="dep-name">Adı</label>
				<Input id="dep-name" placeholder="Birim adı giriniz" bind:value={name} />
			</Col>
			<Col width="6">
				<label for="dep-name">Departman Seçin</label>
				<Select
					on:change={(e) => {
						departmentId = e.target.value;
					}}
				>
					{#if departments.length > 0}
						{#each departments as department}
							<option value={department.id} selected={departmentId == department.id}
								>{department.name}</option
							>
						{/each}
					{/if}
				</Select>
			</Col>
			<Col width="6">
				<label for="dep-name">Durum</label>
				<Select
					on:change={(e) => {
						status = e.target.value;
					}}
				>
					<option value={0} selected={status == 0}>Pasif</option>
					<option value={1} selected={status == 1}>Aktif</option>
				</Select>
			</Col>
			<Col width="6">
				<label for="dep-name">Aktif</label>
				<Select
					on:change={(e) => {
						active = e.target.value;
					}}
				>
					<option value={0} selected={active == 0}>Pasif</option>
					<option value={1} selected={active == 1}>Aktif</option>
				</Select>
			</Col>

			<div class="mt-4 text-end">
				<Button
					secondary
					title="Vazgeç"
					on:click={() => {
						goto('/units');
					}}
				/>
				<Button
					primary
					title="Kaydet"
					on:click={() => {
						handleDBOperations();
					}}
				/>
			</div>
		</Row>
	</div>
</Card>
