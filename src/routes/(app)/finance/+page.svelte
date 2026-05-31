<script>
	import { onMount } from 'svelte';
	import { Finance } from '@controllers/finance';
	import { formatDate } from '@utils/function';

	import Card from '@components/Card.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Badge from '@components/Badge.svelte';

	let payments = [];
	let loading = false;

	// ── Özet istatistikler ───────────────────────────────────────
	$: totalPaid = payments
		.filter((p) => p.status === 2 && !p.is_refund)
		.reduce((s, p) => s + p.amount, 0);

	$: totalPending = payments
		.filter((p) => p.status === 1)
		.reduce((s, p) => s + p.amount, 0);

	$: totalRefund = payments
		.filter((p) => p.is_refund === 1)
		.reduce((s, p) => s + p.amount, 0);

	$: totalNet = totalPaid - totalRefund;

	// ── Yardımcılar ──────────────────────────────────────────────
	function statusLabel(status) {
		if (status === 1) return { text: 'Beklemede', type: 'warning' };
		if (status === 2) return { text: 'Tamamlandı', type: 'success' };
		if (status === 3) return { text: 'İptal', type: 'danger' };
		return { text: '—', type: 'default' };
	}

	function formatAmount(amount, symbol) {
		return `${symbol ?? ''}${Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	function installmentLabel(no, total) {
		if (total <= 1) return '—';
		return `${no} / ${total}`;
	}

	// ── Init ─────────────────────────────────────────────────────
	onMount(async () => {
		loading = true;
		payments = (await Finance.getAll()) || [];
		loading = false;
	});
</script>

<svelte:head>
	<title>Finans | Xess Booking</title>
	<meta name="description" content="Şirkete ait ödeme geçmişini görüntüleyin." />
</svelte:head>

<PageHeader
	title="Finans"
	subTitle="Tüm ödeme kayıtlarınızı buradan takip edebilirsiniz."
/>

<!-- ── Özet Kartları ─────────────────────────────────────────── -->
<div class="summary-grid">
	<div class="summary-card paid">
		<div class="summary-icon">
			<i class="bx bx-check-circle"></i>
		</div>
		<div class="summary-body">
			<span class="summary-label">Toplam Tahsilat</span>
			<span class="summary-value">{formatAmount(totalPaid, '₺')}</span>
		</div>
	</div>

	<div class="summary-card pending">
		<div class="summary-icon">
			<i class="bx bx-time-five"></i>
		</div>
		<div class="summary-body">
			<span class="summary-label">Bekleyen</span>
			<span class="summary-value">{formatAmount(totalPending, '₺')}</span>
		</div>
	</div>

	<div class="summary-card refund">
		<div class="summary-icon">
			<i class="bx bx-revision"></i>
		</div>
		<div class="summary-body">
			<span class="summary-label">İade</span>
			<span class="summary-value">{formatAmount(totalRefund, '₺')}</span>
		</div>
	</div>

	<div class="summary-card net">
		<div class="summary-icon">
			<i class="bx bx-wallet-alt"></i>
		</div>
		<div class="summary-body">
			<span class="summary-label">Net Gelir</span>
			<span class="summary-value">{formatAmount(totalNet, '₺')}</span>
		</div>
	</div>
</div>

<!-- ── Tablo ─────────────────────────────────────────────────── -->
<Card>
	<DataTable data={payments}>
		<table>
			<thead>
				<tr>
					<th>Müşteri</th>
					<th>Rezervasyon</th>
					<th>Ödeme Yöntemi</th>
					<th>Tutar</th>
					<th>İndirim</th>
					<th>Taksit</th>
					<th>Durum</th>
					<th>Ödeme Tarihi</th>
					<th>Kayıt Tarihi</th>
				</tr>
			</thead>
			<tbody>
				{#if loading}
					<tr>
						<td colspan="9" style="padding: 0;">
							<div class="empty-row">
								<i class="bx bx-loader-alt bx-spin"></i>
								Yükleniyor…
							</div>
						</td>
					</tr>
				{:else if payments && payments.length > 0}
					{#each payments as p}
						{@const st = statusLabel(p.status)}
						<tr class:refund-row={p.is_refund === 1}>
							<!-- Müşteri -->
							<td>
								{#if p.customer_name}
									<div class="customer-cell">
										<div class="avatar">
											{p.customer_name
												?.split(' ')
												.map((w) => w[0])
												.join('')
												.slice(0, 2) ?? '?'}
										</div>
										<span class="bold">{p.customer_name}</span>
									</div>
								{:else}
									<span class="muted">—</span>
								{/if}
							</td>

							<!-- Rezervasyon ID (kısa) -->
							<td>
								{#if p.booking_id}
									<span class="booking-id" title={p.booking_id}>
										#{p.booking_id.slice(0, 8)}
									</span>
								{:else}
									<span class="muted">—</span>
								{/if}
							</td>

							<!-- Ödeme Yöntemi -->
							<td>
								<div class="payment-type-cell">
									<i class="bx bx-credit-card"></i>
									{p.payment_type_name ?? '—'}
								</div>
							</td>

							<!-- Tutar -->
							<td>
								<span class="amount {p.is_refund === 1 ? 'refund-amount' : ''}">
									{#if p.is_refund === 1}
										<i class="bx bx-undo refund-icon"></i>
									{/if}
									{formatAmount(p.amount, p.currency_symbol)}
									<small class="currency-code">{p.currency_code ?? ''}</small>
								</span>
							</td>

							<!-- İndirim -->
							<td>
								{#if p.discount_amount > 0}
									<span class="discount-badge" title={p.discount_reason}>
										-{formatAmount(p.discount_amount, p.currency_symbol)}
									</span>
								{:else}
									<span class="muted">—</span>
								{/if}
							</td>

							<!-- Taksit -->
							<td>
								<span class="installment-label">
									{installmentLabel(p.installment_no, p.total_installments)}
								</span>
							</td>

							<!-- Durum -->
							<td>
								{#if st.type === 'success'}
									<Badge primary>{st.text}</Badge>
								{:else if st.type === 'warning'}
									<div class="badge-warning">{st.text}</div>
								{:else if st.type === 'danger'}
									<Badge danger>{st.text}</Badge>
								{:else}
									<span class="muted">{st.text}</span>
								{/if}
							</td>

							<!-- Ödeme Tarihi -->
							<td>
								{#if p.paid_at}
									<span class="date-cell">
										<i class="bx bx-calendar-check"></i>
										{formatDate(p.paid_at)}
									</span>
								{:else}
									<span class="muted">—</span>
								{/if}
							</td>

							<!-- Kayıt Tarihi -->
							<td>
								<span class="date-cell muted">
									{formatDate(p.createdat)}
								</span>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="9" style="padding: 0;">
							<div class="empty-row">
								<i class="bx bx-receipt"></i>
								Henüz ödeme kaydı bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<style>
	/* ── Özet Grid ─────────────────────────────────────────────── */
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 20px;
	}

	@media (max-width: 900px) {
		.summary-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 500px) {
		.summary-grid {
			grid-template-columns: 1fr;
		}
	}

	.summary-card {
		background: #fff;
		border-radius: 12px;
		padding: 20px 22px;
		display: flex;
		align-items: center;
		gap: 16px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
		border-left: 4px solid transparent;
		transition: transform 150ms ease, box-shadow 150ms ease;
	}

	.summary-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
	}

	.summary-card.paid {
		border-left-color: #22c55e;
	}
	.summary-card.pending {
		border-left-color: #f59e0b;
	}
	.summary-card.refund {
		border-left-color: #f5365c;
	}
	.summary-card.net {
		border-left-color: #6366f1;
	}

	.summary-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22px;
		flex-shrink: 0;
	}

	.summary-card.paid .summary-icon {
		background: rgba(34, 197, 94, 0.12);
		color: #16a34a;
	}
	.summary-card.pending .summary-icon {
		background: rgba(245, 158, 11, 0.12);
		color: #d97706;
	}
	.summary-card.refund .summary-icon {
		background: rgba(245, 54, 92, 0.12);
		color: #f5365c;
	}
	.summary-card.net .summary-icon {
		background: rgba(99, 102, 241, 0.12);
		color: #6366f1;
	}

	.summary-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.summary-label {
		font-size: 12px;
		color: #9aa3b0;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.summary-value {
		font-size: 22px;
		font-weight: 700;
		color: #1e2a3b;
		line-height: 1.2;
	}

	/* ── Tablo ─────────────────────────────────────────────────── */
	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead tr {
		background: #f7f8fa;
		border-bottom: 2px solid #ebedf0;
	}

	thead th {
		padding: 12px 16px;
		font-size: 12px;
		font-weight: 600;
		color: #9aa3b0;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-align: left;
		white-space: nowrap;
	}

	tbody tr {
		border-bottom: 1px solid #f0f2f5;
		transition: background-color 120ms ease;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	tbody tr:hover {
		background-color: #fdf5f7;
	}

	tbody tr.refund-row {
		background-color: #fff8f8;
	}

	tbody td {
		padding: 13px 16px;
		font-size: 13px;
		color: #445471;
		vertical-align: middle;
	}

	/* ── Müşteri Hücresi ───────────────────────────────────────── */
	.customer-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.bold {
		font-weight: 600;
	}

	/* ── Rezervasyon ID ────────────────────────────────────────── */
	.booking-id {
		font-family: monospace;
		font-size: 12px;
		background: #f0f2f5;
		padding: 3px 8px;
		border-radius: 6px;
		color: #6b7a99;
		cursor: default;
	}

	/* ── Ödeme Yöntemi ─────────────────────────────────────────── */
	.payment-type-cell {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #445471;
	}

	.payment-type-cell i {
		color: #b0b8c4;
		font-size: 15px;
	}

	/* ── Tutar ─────────────────────────────────────────────────── */
	.amount {
		font-weight: 700;
		font-size: 14px;
		color: #1e2a3b;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.amount.refund-amount {
		color: #f5365c;
	}

	.refund-icon {
		font-size: 14px;
	}

	.currency-code {
		font-size: 10px;
		color: #9aa3b0;
		font-weight: 500;
	}

	/* ── İndirim ───────────────────────────────────────────────── */
	.discount-badge {
		display: inline-block;
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		font-size: 12px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 6px;
	}

	/* ── Taksit ────────────────────────────────────────────────── */
	.installment-label {
		font-size: 12px;
		font-weight: 600;
		color: #6b7a99;
		background: #f0f2f5;
		padding: 3px 8px;
		border-radius: 6px;
	}

	/* ── Durum Badge ───────────────────────────────────────────── */
	.badge-warning {
		display: inline-block;
		background: rgba(245, 158, 11, 0.12);
		color: #d97706;
		font-size: 11px;
		font-weight: 700;
		padding: 4px 10px;
		border-radius: 20px;
		letter-spacing: 0.02em;
	}

	/* ── Tarih ─────────────────────────────────────────────────── */
	.date-cell {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		color: #7a8699;
	}

	.date-cell i {
		font-size: 13px;
		color: #b0b8c4;
	}

	/* ── Genel ─────────────────────────────────────────────────── */
	.muted {
		color: #b0b8c4;
		font-size: 12px;
	}

	/* ── Boş / Yükleniyor ──────────────────────────────────────── */
	.empty-row {
		text-align: center;
		padding: 48px 16px !important;
		color: #b0b8c4;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.empty-row i {
		font-size: 22px;
	}
</style>
