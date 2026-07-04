<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Resource } from '@controllers/resource';
	import { Department } from '@controllers/department';
	import { Service } from '@controllers/service';
	import { User } from '@controllers/user';
	import { getCookie } from '@utils/function';
	import MultiSelect from '@components/MultiSelect.svelte';
	import Select from '@components/Select.svelte';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Tooltip from '@components/helpers/Tooltip.svelte';

	import Button from '@components/Button.svelte';
	import RadioCards from '@components/custom/resources/RadioCards.svelte';
	import StaffForm from '@components/custom/resources/StaffForm.svelte';

	let isUpdate = false;
	let pageTitle = $state();
	let saving = $state(false);
	let loading = $state(true);

	let id;
	let status = $state(1);
	let active = $state(1);
	let formType = $state(1);
	let selectedServices = $state([]);

	let departments = $state([]);
	let services = $state([]);
	let departmentId = $state('');
	let formDatas = $state({});

	let resourceFormStaff = $state({
		id: '',
		name: '',
		limit: 1,
		beginat: '09:00',
		endat: '18:00',
		user_id: ''
	});

	async function handleUnitUpsert() {
		let obj = {
			department_id: departmentId || undefined,
			status: Number(status),
			active: Number(active),
			type: formType,
			services: selectedServices,
			data: { ...resourceFormStaff }
		};

		if (!obj.department_id) delete obj.department_id;
		if (!obj.data.id) delete obj.data.id;
		if (!obj.data.user_id) delete obj.data.user_id;

		let res;

		const handlers = {
			1: {
				create: Resource.createStaff,
				update: Resource.updateStaff,
				getData: () => obj.data
			}
		};

		const handler = handlers[formType];

		if (!handler) return;

		res = isUpdate ? await handler.update({ ...obj, id }) : await handler.create(obj);

		if (res) {
			goto('/units');
		}
	}

	async function handleSaving() {
		saving = true;
		let res = await handleUnitUpsert();
		if (res) {
			setTimeout(() => {
				goto('/units');
			}, 500);
		} else {
			saving = false;
		}
	}

	function handlePageMode() {
		if ($page.params.page == 'create') {
			pageTitle = 'Birim Oluştur';
		} else if ($page.params.page == 'update') {
			isUpdate = true;
			pageTitle = 'Birimi Düzenle';
		} else {
			goto('/units');
		}
	}

	async function loadBaseData() {
		let users;
		[departments, users, services] = await Promise.all([
			Department.getByCompanyId(),
			User.getAllByCompanyId(),
			Service.getByCompanyId()
		]);

		formDatas.users = users.items;
		formDatas.services = services;

		if (departments && departments.length == 1) {
			departmentId = departments[0].id;
		}
	}

	async function loadResource() {
		if (!$page.params.id) return;

		let res = await Resource.getResourceById($page.params.id);
		if (res) {
			id = res.id;
			status = res.status;
			active = res.active;
			departmentId = res.department_id;
			selectedServices = res.services ?? [];

			switch (res.type) {
				case 1:
					resourceFormStaff.id = res.data.id;
					resourceFormStaff.name = res.data.name;
					resourceFormStaff.limit = res.data.limit;
					resourceFormStaff.beginat = res.data.beginat;
					resourceFormStaff.endat = res.data.endat;
					resourceFormStaff.user_id = res.data.user_id;
					break;
				case 2:
					break;
			}
		}
	}

	onMount(init);
	async function init() {
		handlePageMode();
		await loadBaseData();
		if (isUpdate) await loadResource();
		loading = false;
	}
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">{pageTitle}</h5>
</div>

<Card>
	<div class="body-wrapper p-4">
		<Row>
			<Col width="12">
				<!-- bind:value={} -->
				<RadioCards bind:value={formType} />
			</Col>
			{#if loading}
				YÜKLENİYOR
			{:else}
				<StaffForm
					{formDatas}
					data={resourceFormStaff}
					on:input={(e) => {
						resourceFormStaff = e.detail.data;
					}}
				/>
				<Col width="6">
					<label for="res-dep"
						>Departman Seçin (opsiyonel)
						<Tooltip text="Bu kaynağın hangi departmanın altında görüneceğini seçer" position="top">
							<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
						</Tooltip>
					</label>
					<Select
						id="res-dep"
						on:change={(e) => {
							departmentId = e.target.value;
						}}
					>
						{#if !departments || departments.length > 1}
							<option selected disabled>Departman Seçiniz..</option>
						{/if}
						{#if departments && departments.length > 0}
							{#each departments as department}
								<option value={department.id} selected={departmentId == department.id}
									>{department.name}</option
								>
							{/each}
						{/if}
					</Select>
				</Col>

				<Col width="6">
					<label for="">
						Hizmet Seçimi
						<Tooltip text="Bu kaynağın hangi hizmetleri verebileceğini seçer" position="top">
							<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
						</Tooltip>
					</label>
					<MultiSelect
						options={services ?? []}
						placeholder="Hizmet Seçiniz..."
						bind:selected={selectedServices}
					/>
				</Col>

				<Col width="6">
					<label for="res-status">
						Durum
						<Tooltip text="Kaynak durumu" position="top">
							<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
						</Tooltip>
					</label>
					<Select
						id="res-status"
						on:change={(e) => {
							status = parseInt(e.target.value);
						}}
					>
						<option value={0} selected={status == 0}>Pasif</option>
						<option value={1} selected={status == 1}>Aktif</option>
					</Select>
				</Col>
				<Col width="6">
					<label for="res-active">
						Aktif
						<Tooltip text="Kaynak durumu" position="top">
							<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
						</Tooltip>
					</label>
					<Select
						id="res-active"
						on:change={(e) => {
							active = parseInt(e.target.value);
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
					<Button primary title="Kaydet" disabled={saving} on:click={handleSaving} />
				</div>
			{/if}
		</Row>
	</div>
</Card>
