<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import Button from '@components/Button.svelte';

	let pageTitle;

	let name;
	let status;
	let active;

	onMount(() => {
		if ($page.params.page == 'create') {
			pageTitle = 'Departman Oluştur';
		} else if ($page.params.page == 'update') {
			pageTitle = 'Departmanı Düzenle';
		} else {
			goto('/departments');
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
				<Input id="dep-name" placeholder="Departman adı giriniz" />
			</Col>
			<Col width="6">
				<label for="dep-name">Durum</label>
				<Select>
					<option value="">Pasif</option>
					<option value="">Aktif</option>
				</Select>
			</Col>
			<Col width="6">
				<label for="dep-name">Aktif</label>
				<Select>
					<option value="">Pasif</option>
					<option value="">Aktif</option>
				</Select>
			</Col>

			<div class="mt-4 text-end">
				<Button
					secondary
					title="Vazgeç"
					on:click={() => {
						console.log('vazgeç');
					}}
				/>
				<Button
					primary
					title="Kaydet"
					on:click={() => {
						console.log('kaydet');
					}}
				/>
			</div>
		</Row>
	</div>
</Card>
