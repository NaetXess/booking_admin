<script>
	import { goto } from '$app/navigation';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Tabs from '@components/Tabs.svelte';
	import Button from '@components/Button.svelte';
	import Input from '@components/Input.svelte';

	let require_approval = true; // rezervasyonun otomatik onaylanması
	let allow_cancelletions = true; // müşterinin online iptal edebilmesi
	let allow_cancelletions_notice_minutes = 120; //müşteri tarafında iptal öncesi min süre
	let max_booking_advance_days = 5; //max rezervasyon yapılabilecek tarih

	let paramTabs = [
		{ id: 'parametreler', label: 'Genel Parametreler' },
		{ id: 'saatler', label: 'Çalışma Gün ve Saatleri', disabled: true }
	];
	let currentTab = paramTabs[0].id;
</script>

<div class="page-header">
	<div>
		<h5 class="page-title">Firma Parametreleri</h5>
		<p class="page-sub">Firmanın genel ayarlarını düzenleyin</p>
	</div>
	<button class="back-btn" on:click={() => goto('/company')}>
		<i class="bx bx-arrow-back"></i>
		Firma
	</button>
</div>

<Tabs items={paramTabs} bind:activeTab={currentTab}>
	{#if currentTab === 'parametreler'}
		<Card>
			<div class="body-wrapper p-4">
				<Row>
					<Col width="4">
						<label for="">Max İskonto Oranı</label>
						<Input />
					</Col>
					<!-- <Col width="8"></Col>
					<Col width="4">
						<label for="">Otomatik Randevu Kabulu</label>

						<div class="status-toggle">
							<button
								class="toggle-btn {require_approval ? 'active' : ''}"
								on:click={() => (require_approval = true)}
								type="button"
							>
								<i class="bx bx-check-circle"></i> Evet
							</button>
							<button
								class="toggle-btn danger {!require_approval ? 'active-danger' : ''}"
								on:click={() => (require_approval = false)}
								type="button"
							>
								<i class="bx bx-x-circle"></i> Hayır
							</button>
						</div>
					</Col>
					<Col width="8"></Col>
					<Col width="4">
						<label for="">Online Randevu İptali</label>
						<div class="status-toggle">
							<button
								class="toggle-btn {allow_cancelletions ? 'active' : ''}"
								on:click={() => (allow_cancelletions = true)}
								type="button"
							>
								<i class="bx bx-check-circle"></i> Evet
							</button>
							<button
								class="toggle-btn danger {!allow_cancelletions ? 'active-danger' : ''}"
								on:click={() => (allow_cancelletions = false)}
								type="button"
							>
								<i class="bx bx-x-circle"></i> Hayır
							</button>
						</div>
					</Col> -->
				</Row>

				<div class="text-end">
					<Button title="Vazgeç" secondary />
					<Button title="Parametreleri Kaydet" primary />
				</div>
			</div>
		</Card>
	{:else if currentTab === 'saatler'}
		<div>
			<h5>Kapanış Saatleri vb...</h5>
		</div>
	{/if}
</Tabs>

<style>
</style>
