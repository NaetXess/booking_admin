<script>
	import { onMount } from 'svelte';
	import Card from '@components/Card.svelte';
	import Modal from '@components/Modal.svelte';
	import PaymentForm from '@components/custom/finance/PaymentForm.svelte';
	import PaymentList from '@components/custom/finance/PaymentList.svelte';

	let showAddModal = $state(false);
	let listRef = $state(null);

	function openAddModal() {
		showAddModal = true;
	}

	async function handleSuccess() {
		showAddModal = false;
		await listRef?.refresh();
	}
</script>

<svelte:head>
	<title>Finans | Xess Booking</title>
	<meta name="description" content="Şirkete ait ödeme geçmişini görüntüleyin." />
</svelte:head>

<!-- ── Header ─────────────────────────────────────────────────── -->
<div class="page-header-wrap">
	<div>
		<h5 class="page-title">Finans</h5>
		<p class="page-sub">Tüm ödeme kayıtlarınızı buradan takip edebilirsiniz.</p>
	</div>
	<button class="add-btn" onclick={openAddModal}>
		<i class="bx bx-plus"></i> Ödeme Ekle
	</button>
</div>

<!-- ── Liste ──────────────────────────────────────────────────── -->

<PaymentList bind:this={listRef} />

<!-- ── Ödeme Ekleme Modal ─────────────────────────────────────── -->
<Modal title="Yeni Ödeme Kaydı" bind:show={showAddModal}>
	<PaymentForm onSuccess={handleSuccess} />
</Modal>

<style>
	.page-header-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 12px;
	}
	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: #252c38;
		margin: 0 0 2px 0;
	}
	.page-sub {
		font-size: 13px;
		color: #9aa3b0;
		margin: 0;
	}
	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: #f46481;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 9px 18px;
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(244, 100, 129, 0.35);
		transition: all 150ms ease;
		font-family: inherit;
	}
	.add-btn:hover {
		background: #e85577;
		transform: translateY(-1px);
		box-shadow: 0 4px 14px rgba(244, 100, 129, 0.4);
	}
	.add-btn i {
		font-size: 18px;
	}
</style>
