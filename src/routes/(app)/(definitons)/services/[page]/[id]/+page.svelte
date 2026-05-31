<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Service } from '@controllers/Service';
	import { Department } from '@controllers/department';
	import { Currency } from '@controllers/Currency';
	import { DurationType } from '@controllers/duration_type';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import Button from '@components/Button.svelte';

	let pageTitle;
	let isUpdate = false;
	let loading = true;

	let id;
	let name;
	let duration;
	let durationTypeId;
	let price;
	let departmentId;

	let currencyId;

	let status = 1;
	let active = 1;

	// Inputlar
	let currencyTypes;
	let durationTypes;
	let departments = [];

	// Mantıksal Kontroller
	let isReady = false;
	let saving = false;

	$: isReady = name && durationTypeId && duration;

	// İsteklerden birisi patlarsa hepsi null dönecek! İlerde uğraşan kişiye başarılar 04.04.2026 11:00 -Mustafa Erdem ARSLAN
	async function getInputDatas() {
		[currencyTypes, durationTypes, departments] = await Promise.all([
			getCurrencTypes(),
			getDurationTypes(),
			getDepartments()
		]);
	}

	async function getCurrencTypes() {
		let res = await Currency.getAll();
		return res;
	}
	async function getDurationTypes() {
		let res = await DurationType.getAll();
		return res;
	}
	async function getDepartments() {
		let res = await Department.getByCompanyId();
		if (res && res.length == 1) {
			departmentId = res[0].id;
		}
		return res;
	}

	async function handleServiceUpsert() {
		let data = {
			name,
			duration,
			duration_type_id: durationTypeId,
			active,
			price,
			currency_id: currencyId,
			department_id: departmentId
		};

		let res;

		if (isUpdate) {
			data.id = id;
			res = await Service.update(data);
		} else {
			res = await Service.create(data);
		}

		return res;
	}

	async function handleSave() {
		saving = true;
		let isOK = await handleServiceUpsert();

		if (isOK) {
			setTimeout(() => {
				saving = false;
				goto('/services');
			}, 500);
		} else {
			saving = false;
		}
	}

	function handlePageMode() {
		if ($page.params.page == 'create') {
			pageTitle = 'Hizmet Oluştur';
		} else if ($page.params.page == 'update') {
			pageTitle = 'Hizmeti Düzenle';
			isUpdate = true;
		} else {
			goto('/services');
		}
	}

	async function getService() {
		let res = await Service.getById($page.params.id);

		if (res) {
			id = res.id;
			name = res.name;
			currencyId = res.currency_id;
			durationTypeId = res.duration_type_id;
			duration = res.duration;
			price = res.price;
			active = res.active;
			status = res.status;
			departmentId = res.department_id;
		}
	}
	onMount(init);

	async function init() {
		handlePageMode();
		await getInputDatas();
		if (isUpdate) await getService();
		loading = false;
	}
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">{pageTitle}</h5>
</div>

<Card>
	<div class="body-wrapper p-4">
		<div class="section-title">
			<span class="section-num">01</span>
			Hizmet Genel Bilgileri
		</div>

		{#if loading}
			Yükleniyor..
		{:else}
			<Row>
				<Col width="6">
					<label for="ser-name">Adı</label>
					<Input id="ser-name" placeholder="Saç Kesimi" icon="bx-cog" bind:value={name} />
				</Col>
				<Col width="6">
					<label for="ser-active">Departman</label>
					<Select bind:value={departmentId} id="ser-active">
						<option value="" disabled selected>Departman Seçiniz</option>
						{#if departments.length > 0}
							{#each departments as d}
								<option value={d.id} selected={d.id == departmentId}>{d.name}</option>
							{/each}
						{/if}
					</Select>
				</Col>

				<Col width="6">
					<label for="ser-status">Durum</label>
					<Select bind:value={status} id="ser-status">
						<option value={0} selected={status == 0}>Pasif</option>
						<option value={1} selected={status == 1}>Aktif</option>
					</Select>
				</Col>
				<Col width="6">
					<label for="ser-active">Aktif</label>
					<Select bind:value={active} id="ser-active">
						<option value={0} selected={active == 0}>Pasif</option>
						<option value={1} selected={active == 1}>Aktif</option>
					</Select>
				</Col>

				<div class="divider"></div>

				<div class="section-title">
					<span class="section-num">02</span>
					Zaman Ayarları
				</div>
				<Col width="6">
					<label for="dur-type">Zaman Tipi</label>
					<Select id="dur-type" icon="bx-timer" bind:value={durationTypeId}>
						<option value="" disabled selected> Zaman tipi seçiniz...</option>
						{#if durationTypes}
							{#each durationTypes as d}
								<option value={d.id} selected={d.id == durationTypeId}>{d.name}</option>
							{/each}
						{/if}
					</Select>
				</Col>
				<Col width="6">
					<label for="dur-time">Süre</label>
					<Input
						type="number"
						id="dur-time"
						placeholder="45"
						icon="bx-hourglass"
						bind:value={duration}
					/>
				</Col>

				<div class="divider"></div>

				<div class="section-title">
					<span class="section-num">03</span>
					Kur Ayarları
				</div>

				<Col width="6">
					<label for="curr-type">Kur Tipi</label>
					<Select id="curr-type" icon="bx-coin" bind:value={currencyId}>
						<option value="" disabled selected> Kur tipi seçiniz...</option>
						{#if currencyTypes}
							{#each currencyTypes as c}
								<option value={c.id} selected={c.id == currencyId}>{c.symbol} - {c.name}</option>
							{/each}
						{/if}
					</Select>
				</Col>
				<Col width="6">
					<label for="cur-amount">Ücret</label>
					<Input
						type="number"
						id="cur-amount"
						placeholder="250"
						icon="bx-money"
						bind:value={price}
					/>
				</Col>

				<div class="mt-4 text-end">
					<Button
						secondary
						title="Vazgeç"
						on:click={() => {
							console.log('vazgeç');
						}}
					/>
					<Button primary title="Kaydet" disabled={!isReady || saving} on:click={handleSave} />
				</div>
			</Row>
		{/if}
	</div>
</Card>
