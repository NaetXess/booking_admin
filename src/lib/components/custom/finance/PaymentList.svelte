<script>
	import { onMount } from 'svelte';
	import { Finance } from '@controllers/finance';
	import { formatDate } from '@utils/function';
	import Badge from '@components/Badge.svelte';
	import Card from '@components/Card.svelte';

	/**
	 * @type {{
	 *   bookingId?: string | null,
	 *   compact?: boolean,
	 *   onStatusChange?: (payment: any, newStatus: number) => void
	 * }}
	 *
	 * bookingId  → null = tüm şirket ödemeleri, string = o rezervasyona ait
	 * compact    → true = basit liste (rezervasyon modal'ı sağ paneli)
	 */
	let { bookingId = null, compact = false, onStatusChange = null } = $props();

	let payments = $state([]);
	let summary = $state(null);
	let loading = $state(false);
	let updatingId = $state(null);

	// ── Özet (sadece bookingId varsa backend'den alınır) ─────────
	let totalPaid = $derived(
		bookingId
			? summary?.total_paid ?? 0
			: payments.filter((p) => p.status === 2 && !p.is_refund).reduce((s, p) => s + p.amount, 0)
	);
	let totalPending = $derived(
		bookingId
			? summary?.total_pending ?? 0
			: payments.filter((p) => p.status === 1).reduce((s, p) => s + p.amount, 0)
	);
	let totalRefund = $derived(
		bookingId
			? summary?.total_refund ?? 0
			: payments.filter((p) => p.is_refund === 1).reduce((s, p) => s + p.amount, 0)
	);
	let netAmount = $derived(totalPaid - totalRefund);

	// ── Yardımcılar ───────────────────────────────────────────────
	function statusLabel(status) {
		if (status === 1) return { text: 'Beklemede', type: 'warning' };
		if (status === 2) return { text: 'Tamamlandı', type: 'success' };
		if (status === 3) return { text: 'İptal', type: 'danger' };
		return { text: '—', type: 'default' };
	}

	function fmt(amount, symbol = '') {
		return `${symbol}${Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	function installmentLabel(no, total) {
		return total <= 1 ? '—' : `${no} / ${total}`;
	}

	// ── Durum güncelleme ─────────────────────────────────────────
	async function handleStatusChange(payment, newStatus) {
		updatingId = payment.id;
		const res = await Finance.updatePayment({
			id: payment.id,
			status: parseInt(newStatus),
			payment_type_id: payment.payment_type_id,
			currency_id: payment.currency_id,
			amount: payment.amount
		});
		if (res) {
			payments = payments.map((p) =>
				p.id === payment.id ? { ...p, status: parseInt(newStatus) } : p
			);
			onStatusChange?.(payment, parseInt(newStatus));
		}
		updatingId = null;
	}

	async function handleRefundClick(p) {
		const confirmed = confirm(
			`${fmt(p.amount, p.currency_symbol || '')} tutarındaki ödemeyi iade etmek istediğinize emin misiniz?`
		);
		if (!confirmed) return;

		updatingId = p.id;
		try {
			const res = await Finance.createPayment({
				booking_id: p.booking_id,
				customer_id: p.customer_id || undefined,
				payment_type_id: p.payment_type_id,
				currency_id: p.currency_id,
				amount: p.amount,
				is_refund: 1,
				refund_of_id: p.id,
				status: 2,
				paid_at: new Date().toISOString(),
				description: `${p.id} ID'li ödemenin iadesi.`
			});
			if (res) {
				await refresh();
			}
		} catch (err) {
			console.error(err);
			alert('İade işlemi sırasında bir hata oluştu.');
		} finally {
			updatingId = null;
		}
	}

	// ── Veri yükleme ─────────────────────────────────────────────
	export async function refresh() {
		loading = true;
		if (bookingId) {
			[payments, summary] = await Promise.all([
				Finance.getPaymentsByBookingId(bookingId).then((r) => r || []),
				Finance.getSummaryByBookingId(bookingId).then((r) => r || null)
			]);
		} else {
			payments = (await Finance.getAll()) || [];
		}

		loading = false;
	}

	onMount(() => refresh());
</script>

<!-- ── Özet Kartları ──────────────────────────────────────────── -->
<div class="pl-summary" class:compact>
	<div class="pl-sum-card paid">
		<span class="pl-sum-label">Tahsilat</span>
		<span class="pl-sum-val">{fmt(totalPaid, '₺')}</span>
	</div>
	<div class="pl-sum-card pending">
		<span class="pl-sum-label">Bekleyen</span>
		<span class="pl-sum-val">{fmt(totalPending, '₺')}</span>
	</div>
	<div class="pl-sum-card refund">
		<span class="pl-sum-label">İade</span>
		<span class="pl-sum-val">{fmt(totalRefund, '₺')}</span>
	</div>
	<div class="pl-sum-card net">
		<span class="pl-sum-label">Net</span>
		<span class="pl-sum-val">{fmt(netAmount, '₺')}</span>
	</div>
</div>

<!-- ── Liste ──────────────────────────────────────────────────── -->
{#snippet tableContent()}
	<div class="pl-table-wrap">
		{#if loading}
			<div class="pl-empty"><i class="bx bx-loader-alt bx-spin"></i> Yükleniyor…</div>
		{:else if payments.length === 0}
			<div class="pl-empty"><i class="bx bx-receipt"></i> Henüz ödeme kaydı yok.</div>
		{:else}
			<table class="pl-table">
				<thead>
					<tr>
						{#if !compact}<th>Müşteri</th>{/if}
						{#if !bookingId}<th>Randevu</th>{/if}
						<th>Yöntem</th>
						<th>Tutar</th>
						{#if !compact}<th>İndirim</th>{/if}
						<th>Taksit</th>
						<th>Durum</th>
						{#if !compact}<th>Ödeme Tar.</th>{/if}
						{#if !compact}<th>İşlem</th>{/if}
					</tr>
				</thead>
				<tbody>
					{#each payments as p}
						{@const st = statusLabel(p.status)}
						<tr class:refund-row={p.is_refund === 1}>
							{#if !compact}
								<td>
									{#if p.customer_name}
										<div class="pl-customer">
											<div class="pl-avatar">
												{p.customer_name
													?.split(' ')
													.map((w) => w[0])
													.join('')
													.slice(0, 2)}
											</div>
											<span>{p.customer_name}</span>
										</div>
									{:else}<span class="muted">—</span>{/if}
								</td>
							{/if}
							{#if !bookingId}
								<td>
									{#if p.booking_id}
										<span class="pl-booking-id" title={p.booking_id}
											>#{p.booking_id.slice(0, 8)}</span
										>
									{:else}<span class="muted">—</span>{/if}
								</td>
							{/if}
							<td>
								<div class="pl-ptype">
									<i class="bx bx-credit-card"></i>{p.payment_type_name ?? '—'}
								</div>
							</td>
							<td>
								<span class="pl-amount" class:refund={p.is_refund === 1}>
									{#if p.is_refund === 1}<i class="bx bx-undo"></i>{/if}
									{fmt(p.amount, p.currency_symbol ?? '')}
									<small>{p.currency_code ?? ''}</small>
								</span>
							</td>
							{#if !compact}
								<td>
									{#if p.discount_amount > 0}
										<span class="pl-disc" title={p.discount_reason}
											>-{fmt(p.discount_amount, p.currency_symbol ?? '')}</span
										>
									{:else}<span class="muted">—</span>{/if}
								</td>
							{/if}
							<td
								><span class="pl-inst"
									>{installmentLabel(p.installment_no, p.total_installments)}</span
								></td
							>
							<td>
								{#if st.type === 'success'}<Badge primary>{st.text}</Badge>
								{:else if st.type === 'warning'}<span class="badge-warn">{st.text}</span>
								{:else if st.type === 'danger'}<Badge danger>{st.text}</Badge>
								{:else}<span class="muted">{st.text}</span>{/if}
							</td>
							{#if !compact}
								<td>
									{#if p.paid_at}
										<span class="pl-date"
											><i class="bx bx-calendar-check"></i>{formatDate(p.paid_at)}</span
										>
									{:else}<span class="muted">—</span>{/if}
								</td>
							{/if}
							<!-- Durum değiştirme -->
							<td>
								{#if updatingId === p.id}
									<i class="bx bx-loader-alt bx-spin muted"></i>
								{:else}
									<div class="pl-status-wrap">
										<select
											class="pl-status-sel"
											value={p.status}
											onchange={(e) => handleStatusChange(p, e.target.value)}
										>
											<option value={1}>Beklemede</option>
											<option value={2}>Tamamlandı</option>
											<option value={3}>İptal</option>
										</select>
										<i class="bx bx-chevron-down pl-chevron"></i>
									</div>
								{/if}
							</td>
							{#if !compact}
								<td>
									{#if p.is_refund === 0 && p.status === 2}
										{@const isRefunded = payments.some(
											(x) => x.is_refund === 1 && x.refund_of_id === p.id
										)}
										{#if isRefunded}
											<span class="pl-refunded-badge">
												<i class="bx bx-check-circle"></i> İade Edildi
											</span>
										{:else}
											<button
												class="pl-refund-btn"
												onclick={() => handleRefundClick(p)}
												title="Bu ödemeyi iade et"
											>
												<i class="bx bx-undo"></i> İade Et
											</button>
										{/if}
									{/if}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
{/snippet}

{#if summary}
	{@render tableContent()}
{:else}
	<Card>
		{@render tableContent()}
	</Card>
{/if}

<style>
	/* ── Özet ────────────────────────────────────────────────────── */
	.pl-summary {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		margin-bottom: 14px;
	}
	.pl-summary.compact {
		gap: 6px;
	}
	.pl-sum-card {
		background: #fff;
		border-radius: 10px;
		padding: 12px 14px;
		border-left: 3px solid transparent;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	}
	.pl-sum-card.paid {
		border-left-color: #22c55e;
	}
	.pl-sum-card.pending {
		border-left-color: #f59e0b;
	}
	.pl-sum-card.refund {
		border-left-color: #f5365c;
	}
	.pl-sum-card.net {
		border-left-color: #6366f1;
	}
	.pl-sum-label {
		display: block;
		font-size: 10.5px;
		color: #9aa3b0;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.pl-sum-val {
		display: block;
		font-size: 15px;
		font-weight: 700;
		color: #1e2a3b;
		margin-top: 2px;
	}
	.pl-summary.compact .pl-sum-val {
		font-size: 13px;
	}

	/* ── Tablo ───────────────────────────────────────────────────── */
	.pl-table-wrap {
		overflow-x: auto;
	}
	.pl-table {
		width: 100%;
		border-collapse: collapse;
	}
	.pl-table thead tr {
		background: #f7f8fa;
		border-bottom: 2px solid #ebedf0;
	}
	.pl-table thead th {
		padding: 10px 12px;
		font-size: 11px;
		font-weight: 600;
		color: #9aa3b0;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-align: left;
		white-space: nowrap;
	}
	.pl-table tbody tr {
		border-bottom: 1px solid #f0f2f5;
		transition: background 120ms;
	}
	.pl-table tbody tr:last-child {
		border-bottom: none;
	}
	.pl-table tbody tr:hover {
		background: #fdf5f7;
	}
	.pl-table tbody tr.refund-row {
		background: #fff8f8;
	}
	.pl-table tbody td {
		padding: 10px 12px;
		font-size: 12.5px;
		color: #445471;
		vertical-align: middle;
	}

	.pl-customer {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.pl-avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.pl-booking-id {
		font-family: monospace;
		font-size: 11.5px;
		background: #f0f2f5;
		padding: 2px 7px;
		border-radius: 5px;
		color: #6b7a99;
	}
	.pl-ptype {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.pl-ptype i {
		color: #b0b8c4;
		font-size: 14px;
	}
	.pl-amount {
		font-weight: 700;
		font-size: 13px;
		color: #1e2a3b;
		display: flex;
		align-items: center;
		gap: 3px;
	}
	.pl-amount.refund {
		color: #f5365c;
	}
	.pl-amount small {
		font-size: 10px;
		color: #9aa3b0;
		font-weight: 500;
	}
	.pl-disc {
		display: inline-block;
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		font-size: 11.5px;
		font-weight: 600;
		padding: 2px 7px;
		border-radius: 5px;
	}
	.pl-inst {
		font-size: 11.5px;
		font-weight: 600;
		color: #6b7a99;
		background: #f0f2f5;
		padding: 2px 7px;
		border-radius: 5px;
	}
	.badge-warn {
		display: inline-block;
		background: rgba(245, 158, 11, 0.12);
		color: #d97706;
		font-size: 11px;
		font-weight: 700;
		padding: 3px 9px;
		border-radius: 20px;
	}
	.pl-date {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11.5px;
		color: #7a8699;
	}
	.pl-date i {
		font-size: 12px;
		color: #b0b8c4;
	}
	.muted {
		color: #b0b8c4;
		font-size: 11.5px;
	}

	.pl-status-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.pl-status-sel {
		appearance: none;
		border: 1.5px solid #ebedf0;
		border-radius: 7px;
		background: #fafbfc;
		font-size: 11.5px;
		font-weight: 600;
		color: #445471;
		padding: 4px 24px 4px 8px;
		cursor: pointer;
		outline: none;
		transition: border-color 150ms;
		font-family: inherit;
	}
	.pl-status-sel:hover {
		border-color: #f5365c;
	}
	.pl-chevron {
		position: absolute;
		right: 5px;
		font-size: 13px;
		color: #b0b8c4;
		pointer-events: none;
	}

	.pl-empty {
		text-align: center;
		padding: 36px 16px;
		color: #b0b8c4;
		font-size: 13.5px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.pl-empty i {
		font-size: 20px;
	}

	.pl-refund-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: #fff;
		border: 1.5px solid #ebedf0;
		color: #f5365c;
		border-radius: 6px;
		padding: 4px 8px;
		font-size: 11.5px;
		font-weight: 600;
		cursor: pointer;
		transition: all 120ms ease;
		font-family: inherit;
	}
	.pl-refund-btn:hover {
		background: #fff5f6;
		border-color: #f5365c;
	}
	.pl-refund-btn i {
		font-size: 14px;
	}
	.pl-refunded-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #9aa3b0;
		font-size: 11.5px;
		font-weight: 600;
		background: #f4f5f7;
		padding: 4px 8px;
		border-radius: 6px;
	}
	.pl-refunded-badge i {
		color: #22c55e;
		font-size: 14px;
	}
</style>
