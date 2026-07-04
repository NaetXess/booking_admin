<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Department } from '@controllers/department';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import Button from '@components/Button.svelte';

	let pageTitle = $state();

	let id;
	let name = $state();
	let status = $state(1);
	let active = $state(1);

	let isUpdate = 0;
	let saving = $state(false);

	async function handleDepartmentUpsert() {
		let data = {
			name,
			active,
			status
		};

		let res;
		if (!isUpdate) {
			res = await Department.create(data);
		} else {
			data.id = id;
			res = await Department.update(data);
		}

		if (res) {
			return true;
		}
		return false;
	}

	async function handleSave() {
		saving = true;
		let isOK = await handleDepartmentUpsert();
		if (isOK) {
			setTimeout(() => {
				goto('/departments');
			}, 500);
		} else {
			saving = false;
		}
	}

	onMount(async () => {
		if ($page.params.page == 'create') {
			pageTitle = 'Departman Oluştur';
		} else if ($page.params.page == 'update') {
			pageTitle = 'Departmanı Düzenle';
			isUpdate = 1;
		} else {
			goto('/departments');
		}

		if (isUpdate == 1) {
			let res = await Department.getById($page.params.id);

			if (res) {
				id = res.id;
				name = res.name;
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
			<h4>Departman</h4>
		</div>
		<Row>
			<Col width="12">
				<label for="dep-name">Adı</label>
				<Input
					id="dep-name"
					placeholder="Departman adı giriniz"
					icon="bx-store"
					bind:value={name}
				/>
			</Col>
			<Col width="6">
				<label for="dep-name">Durum (Geçici olarak kapalı)</label>
				<Select disabled icon="bx-pencil" bind:value={status}>
					<option value={0}>Pasif</option>
					<option value={1} selected={status == 1}>Aktif</option>
				</Select>
			</Col>
			<Col width="6">
				<label for="dep-name">Aktif</label>
				<Select icon="bx-pencil" bind:value={active}>
					<option value={0}>Pasif</option>
					<option value={1} selected={active == 1}>Aktif</option>
				</Select>
			</Col>

			<div class="mt-4 text-end">
				<Button
					secondary
					title="Vazgeç"
					on:click={() => {
						goto('/departments');
					}}
				/>
				<Button primary title="Kaydet" disabled={saving} on:click={handleSave} />
			</div>
		</Row>
	</div>
</Card>
