<script>
	import { onMount } from 'svelte';
	import { Finance, PaymentType } from '@controllers/finance';
	import { Currency } from '@controllers/currency';
	import { Booking } from '@controllers/booking';
	import { Service } from '@controllers/service';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import BookingSelector from './BookingSelector.svelte';

	/**
	 * @type {{
	 *   bookingId?: string,
	 *   compact?: boolean,
	 *   onSuccess?: () => void
	 * }}
	 *
	 * bookingId  → dolu gelirse otomatik doldurulur ve kilitlenir
	 * compact    → true = tek sütun, taksit sekmesi yok (rezervasyon modal'ı)
	 * onSuccess  → kayıt sonrası parent'a bildirim
	 */
	let {
		bookingId = '',
		compact = false,
		onSuccess = () => {},
		showSubmitButton = true,
		showBookingSelector = true,
		isPriceLocked = false,
		initialGrossAmount = 0,
		initialCurrencyId = '',
		customerId = ''
	} = $props();

	let paymentTypes = $state([]);
	let currencies = $state([]);
	let saving = $state(false);
	let mode = $state('single'); // 'single' | 'installment'

	$effect(() => {
		sf.booking_id = bookingId;
		inf.booking_id = bookingId;
	});

	$effect(() => {
		if (initialGrossAmount > 0) {
			sf.gross_amount = initialGrossAmount.toString();
			inf.gross_amount = initialGrossAmount.toString();
		}
	});

	$effect(() => {
		if (initialCurrencyId) {
			sf.currency_id = initialCurrencyId;
			inf.currency_id = initialCurrencyId;
		}
	});

	// ── Tekil form ────────────────────────────────────────────────
	const emptySingle = () => ({
		booking_id: bookingId || '',
		payment_type_id: '',
		currency_id: '',
		gross_amount: '',
		discount_type: 'amount',
		discount_value: '',
		discount_reason: '',
		is_refund: 0,
		status: 1,
		paid_at: '',
		description: ''
	});

	// ── Taksit formu ──────────────────────────────────────────────
	const emptyInstallment = () => ({
		booking_id: bookingId || '',
		payment_type_id: '',
		currency_id: '',
		gross_amount: '',
		discount_type: 'amount',
		discount_value: '',
		discount_reason: '',
		installments: 2,
		description: ''
	});

	let sf = $state(emptySingle());
	let inf = $state(emptyInstallment());

	// ── Tekil hesaplamalar ────────────────────────────────────────
	let sDiscountAmt = $derived.by(() => {
		const g = parseFloat(sf.gross_amount) || 0;
		const v = parseFloat(sf.discount_value) || 0;
		return sf.discount_type === 'rate' ? Math.round(((g * v) / 100) * 100) / 100 : v;
	});
	let sNetAmt = $derived(
		Math.max(0, Math.round(((parseFloat(sf.gross_amount) || 0) - sDiscountAmt) * 100) / 100)
	);
	let sDiscountRate = $derived(
		sf.discount_type === 'rate' ? parseFloat(sf.discount_value) || 0 : 0
	);

	// ── Taksit hesaplamalar ───────────────────────────────────────
	let iDiscountAmt = $derived.by(() => {
		const g = parseFloat(inf.gross_amount) || 0;
		const v = parseFloat(inf.discount_value) || 0;
		return inf.discount_type === 'rate' ? Math.round(((g * v) / 100) * 100) / 100 : v;
	});
	let iNetAmt = $derived(
		Math.max(0, Math.round(((parseFloat(inf.gross_amount) || 0) - iDiscountAmt) * 100) / 100)
	);
	let iDiscountRate = $derived(
		inf.discount_type === 'rate' ? parseFloat(inf.discount_value) || 0 : 0
	);
	let iPerInstallment = $derived.by(() => {
		const n = Math.max(2, parseInt(inf.installments) || 2);
		return iNetAmt > 0 ? Math.round((iNetAmt / n) * 100) / 100 : 0;
	});

	// ── Yardımcılar ───────────────────────────────────────────────
	function fmt(amount) {
		return Number(amount).toLocaleString('tr-TR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	export function reset() {
		sf = emptySingle();
		inf = emptyInstallment();
		mode = 'single';
	}

	export async function save(newBookingId, newCustomerId, resourceId) {
		const targetBookingId = newBookingId || bookingId || sf.booking_id || inf.booking_id || '';
		if (!targetBookingId) return false;

		const targetCustomerId = newCustomerId || customerId || '';
		const targetResourceId = resourceId || '';

		if (mode === 'single') {
			if (!sf.payment_type_id || !sf.currency_id || !sf.gross_amount) return false;
			saving = true;

			const res = await Finance.createPayment({
				booking_id: targetBookingId,
				customer_id: targetCustomerId || null,
				resource_id: targetResourceId || null,
				payment_type_id: sf.payment_type_id,
				currency_id: sf.currency_id,
				amount: sNetAmt,
				discount_amount: sDiscountAmt,
				discount_rate: sDiscountRate,
				discount_reason: sf.discount_reason,
				is_refund: parseInt(sf.is_refund),
				status: parseInt(sf.status),
				paid_at: sf.paid_at ? new Date(sf.paid_at).toISOString() : null,
				description: sf.description,
				installment_no: 1,
				total_installments: 1
			});
			saving = false;

			return !!res;
		} else {
			if (!inf.payment_type_id || !inf.currency_id || !inf.gross_amount) return false;
			if (parseInt(inf.installments) < 2) return false;
			saving = true;
			const res = await Finance.createInstallmentPlan({
				booking_id: targetBookingId,
				customer_id: targetCustomerId || null,
				resource_id: targetResourceId || null,
				payment_type_id: inf.payment_type_id,
				currency_id: inf.currency_id,
				gross_amount: parseFloat(inf.gross_amount),
				discount_amount: iDiscountAmt,
				discount_rate: iDiscountRate,
				discount_reason: inf.discount_reason,
				installments: parseInt(inf.installments),
				description: inf.description
			});
			saving = false;
			return !!res;
		}
	}

	// ── Rezervasyon Seçimi ve Tutar/Döviz Doldurma ───────────────
	async function handleBookingSelect(booking) {
		const bId = booking?.id || '';
		sf.booking_id = bId;
		inf.booking_id = bId;

		if (!bId) {
			sf.gross_amount = '';
			sf.currency_id = '';
			inf.gross_amount = '';
			inf.currency_id = '';
			return;
		}

		// Rezervasyonun detayından servisini bulup fiyat & para birimini çekelim
		const res = await Booking.getBookingById(bId);
		if (res && res.length > 0) {
			const bInfo = res[0];
			if (bInfo.service_id) {
				const sInfo = await Service.getById(bInfo.service_id);
				if (sInfo) {
					// Tekil forma doldur
					sf.gross_amount = sInfo.price ? String(sInfo.price) : '';
					sf.currency_id = sInfo.currency_id || '';
					// Taksit formuna doldur
					inf.gross_amount = sInfo.price ? String(sInfo.price) : '';
					inf.currency_id = sInfo.currency_id || '';
				}
			}
		}
	}

	// ── Kaydet: tekil ─────────────────────────────────────────────
	async function handleSingle() {
		if (!sf.payment_type_id || !sf.currency_id || !sf.gross_amount) return;
		saving = true;
		const res = await Finance.createPayment({
			booking_id: sf.booking_id || '',
			payment_type_id: sf.payment_type_id,
			currency_id: sf.currency_id,
			amount: sNetAmt,
			discount_amount: sDiscountAmt,
			discount_rate: sDiscountRate,
			discount_reason: sf.discount_reason,
			is_refund: parseInt(sf.is_refund),
			status: parseInt(sf.status),
			paid_at: sf.paid_at ? new Date(sf.paid_at).toISOString() : null,
			description: sf.description,
			installment_no: 1,
			total_installments: 1
		});
		if (res) {
			reset();
			onSuccess();
		}
		saving = false;
	}

	// ── Kaydet: taksit ────────────────────────────────────────────
	async function handleInstallment() {
		if (!inf.payment_type_id || !inf.currency_id || !inf.gross_amount) return;
		if (parseInt(inf.installments) < 2) return;
		saving = true;
		const res = await Finance.createInstallmentPlan({
			booking_id: inf.booking_id || '',
			payment_type_id: inf.payment_type_id,
			currency_id: inf.currency_id,
			gross_amount: parseFloat(inf.gross_amount),
			discount_amount: iDiscountAmt,
			discount_rate: iDiscountRate,
			discount_reason: inf.discount_reason,
			installments: parseInt(inf.installments),
			description: inf.description
		});
		if (res) {
			reset();
			onSuccess();
		}
		saving = false;
	}

	onMount(async () => {
		[paymentTypes, currencies] = await Promise.all([
			PaymentType.getAll().then((r) => r || []),
			Currency.getAll().then((r) => r || [])
		]);
	});
</script>

<!-- ── Sekme (compact modda gösterilmez) ─────────────────────── -->
{#if !compact}
	<div class="pf-tabs">
		<button class="pf-tab" class:active={mode === 'single'} onclick={() => (mode = 'single')}>
			<i class="bx bx-money"></i> Tekil Ödeme
		</button>
		<button
			class="pf-tab"
			class:active={mode === 'installment'}
			onclick={() => (mode = 'installment')}
		>
			<i class="bx bx-calendar-week"></i> Taksit Planı
		</button>
	</div>
{/if}

<!-- ══════════════ TEKİL ÖDEME ══════════════ -->
{#if mode === 'single' || compact}
	<div class="pf-grid" class:compact>
		{#if !bookingId && showBookingSelector}
			<div class="pf-group pf-full">
				<label class="pf-label">Rezervasyon İlişkisi</label>
				<BookingSelector onSelect={handleBookingSelect} />
			</div>
		{/if}

		<div class="pf-group">
			<label class="pf-label" for="pf-gross">Brüt Tutar <span class="req">*</span></label>
			<Input
				id="pf-gross"
				type="number"
				placeholder="0.00"
				icon="bx-lira"
				bind:value={sf.gross_amount}
				disabled={isPriceLocked}
			/>
		</div>

		<div class="pf-group">
			<label class="pf-label">İndirim</label>
			<div class="pf-discount-row">
				<div class="pf-disc-toggle">
					<button
						class="pf-disc-btn"
						class:active={sf.discount_type === 'amount'}
						onclick={() => (sf.discount_type = 'amount')}>₺</button
					>
					<button
						class="pf-disc-btn"
						class:active={sf.discount_type === 'rate'}
						onclick={() => (sf.discount_type = 'rate')}>%</button
					>
				</div>
				<Input
					id="pf-disc"
					type="number"
					placeholder={sf.discount_type === 'rate' ? '10' : '0.00'}
					icon="bx-purchase-tag"
					bind:value={sf.discount_value}
				/>
			</div>
		</div>

		<div class="pf-group">
			<label class="pf-label" for="pf-ptype">Ödeme Yöntemi <span class="req">*</span></label>
			<Select id="pf-ptype" icon="bx-credit-card" bind:value={sf.payment_type_id}>
				<option value="">Seçiniz</option>
				{#each paymentTypes as pt}<option value={pt.id}>{pt.name}</option>{/each}
			</Select>
		</div>

		<div class="pf-group">
			<label class="pf-label" for="pf-currency">Para Birimi <span class="req">*</span></label>
			<Select id="pf-currency" icon="bx-globe" bind:value={sf.currency_id} disabled={isPriceLocked}>
				<option value="">Seçiniz</option>
				{#each currencies as c}<option value={c.id}>{c.code} — {c.name ?? ''}</option>{/each}
			</Select>
		</div>

		{#if !compact}
			<div class="pf-group">
				<label class="pf-label" for="pf-status">Durum</label>
				<Select id="pf-status" icon="bx-check-shield" bind:value={sf.status}>
					<option value={1}>Beklemede</option>
					<option value={2}>Tamamlandı</option>
					<option value={3}>İptal</option>
				</Select>
			</div>

			<div class="pf-group">
				<label class="pf-label" for="pf-isrefund">Tür</label>
				<Select id="pf-isrefund" icon="bx-transfer" bind:value={sf.is_refund}>
					<option value={0}>Normal Ödeme</option>
					<option value={1}>İade</option>
				</Select>
			</div>

			{#if parseInt(sf.is_refund) === 1}
				<div class="pf-group pf-full">
					<label class="pf-label" for="pf-refund-of"
						>İade Edilecek Ödeme Kaydı <span class="req">*</span></label
					>
					<Select id="pf-refund-of" icon="bx-history" bind:value={sf.refund_of_id}>
						<option value="">Seçiniz</option>
						{#each bookingPayments as bp}
							<option value={bp.id}>
								{bp.payment_type_name || 'Ödeme'} — {fmt(bp.amount)}
								{bp.currency_symbol || bp.currency_code || ''} ({bp.paid_at
									? new Date(bp.paid_at).toLocaleDateString('tr-TR')
									: 'Tarih Yok'})
							</option>
						{/each}
					</Select>
				</div>
			{/if}

			<div class="pf-group">
				<label class="pf-label" for="pf-paidat">Ödeme Tarihi</label>
				<Input id="pf-paidat" type="date" icon="bx-calendar" bind:value={sf.paid_at} />
			</div>
		{/if}

		{#if !compact}
			<div class="pf-group pf-full">
				<label class="pf-label" for="pf-dreason">İndirim Sebebi</label>
				<Input
					id="pf-dreason"
					placeholder="İndirim sebebini yazın..."
					icon="bx-note"
					bind:value={sf.discount_reason}
				/>
			</div>

			<div class="pf-group pf-full">
				<label class="pf-label" for="pf-desc">Açıklama</label>
				<Input
					id="pf-desc"
					type="textarea"
					rows={2}
					placeholder="Not ekleyin..."
					bind:value={sf.description}
				/>
			</div>
		{/if}

		<!-- Özet -->
		{#if parseFloat(sf.gross_amount) > 0}
			<div class="pf-group pf-full">
				<div class="pf-calc">
					<div class="pf-calc-row">
						<span>Brüt Tutar</span><span>{fmt(parseFloat(sf.gross_amount) || 0)}</span>
					</div>
					{#if sDiscountAmt > 0}
						<div class="pf-calc-row disc">
							<span>İndirim{sf.discount_type === 'rate' ? ` (%${sf.discount_value})` : ''}</span
							><span>-{fmt(sDiscountAmt)}</span>
						</div>
					{/if}
					<div class="pf-calc-row net"><span>Net Tutar</span><strong>{fmt(sNetAmt)}</strong></div>
				</div>
			</div>
		{/if}
	</div>

	{#if showSubmitButton}
		<div class="pf-footer">
			<button
				class="pf-save-btn"
				disabled={saving || !sf.payment_type_id || !sf.currency_id || !sf.gross_amount}
				onclick={handleSingle}
			>
				{#if saving}<i class="bx bx-loader-alt bx-spin"></i> Kaydediliyor…{:else}<i
						class="bx bx-check"
					></i> Kaydet{/if}
			</button>
		</div>
	{/if}

	<!-- ══════════════ TAKSİT PLANI ══════════════ -->
{:else}
	<div class="pf-grid">
		{#if !bookingId && showBookingSelector}
			<div class="pf-group pf-full">
				<label class="pf-label">Rezervasyon İlişkisi</label>
				<BookingSelector onSelect={handleBookingSelect} />
			</div>
		{/if}

		<div class="pf-group">
			<label class="pf-label" for="if-gross">Brüt Tutar <span class="req">*</span></label>
			<Input
				id="if-gross"
				type="number"
				placeholder="0.00"
				icon="bx-lira"
				bind:value={inf.gross_amount}
				disabled={isPriceLocked}
			/>
		</div>

		<div class="pf-group">
			<label class="pf-label">İndirim</label>
			<div class="pf-discount-row">
				<div class="pf-disc-toggle">
					<button
						class="pf-disc-btn"
						class:active={inf.discount_type === 'amount'}
						onclick={() => (inf.discount_type = 'amount')}>₺</button
					>
					<button
						class="pf-disc-btn"
						class:active={inf.discount_type === 'rate'}
						onclick={() => (inf.discount_type = 'rate')}>%</button
					>
				</div>
				<Input
					id="if-disc"
					type="number"
					placeholder={inf.discount_type === 'rate' ? '10' : '0.00'}
					icon="bx-purchase-tag"
					bind:value={inf.discount_value}
				/>
			</div>
		</div>

		<div class="pf-group">
			<label class="pf-label" for="if-ptype">Ödeme Yöntemi <span class="req">*</span></label>
			<Select id="if-ptype" icon="bx-credit-card" bind:value={inf.payment_type_id}>
				<option value="">Seçiniz</option>
				{#each paymentTypes as pt}<option value={pt.id}>{pt.name}</option>{/each}
			</Select>
		</div>

		<div class="pf-group">
			<label class="pf-label" for="if-currency">Para Birimi <span class="req">*</span></label>
			<Select
				id="if-currency"
				icon="bx-globe"
				bind:value={inf.currency_id}
				disabled={isPriceLocked}
			>
				<option value="">Seçiniz</option>
				{#each currencies as c}<option value={c.id}>{c.code} — {c.name ?? ''}</option>{/each}
			</Select>
		</div>

		<div class="pf-group">
			<label class="pf-label" for="if-count">Taksit Sayısı <span class="req">*</span></label>
			<Input
				id="if-count"
				type="number"
				placeholder="2"
				icon="bx-list-ol"
				min={2}
				max={120}
				bind:value={inf.installments}
			/>
		</div>

		<div class="pf-group pf-full">
			<label class="pf-label" for="if-dreason">İndirim Sebebi</label>
			<Input
				id="if-dreason"
				placeholder="İndirim sebebini yazın..."
				icon="bx-note"
				bind:value={inf.discount_reason}
			/>
		</div>

		<div class="pf-group pf-full">
			<label class="pf-label" for="if-desc">Açıklama</label>
			<Input
				id="if-desc"
				type="textarea"
				rows={2}
				placeholder="Not ekleyin..."
				bind:value={inf.description}
			/>
		</div>

		{#if parseFloat(inf.gross_amount) > 0 && parseInt(inf.installments) >= 2}
			<div class="pf-group pf-full">
				<div class="pf-calc">
					<div class="pf-calc-row">
						<span>Brüt Tutar</span><span>{fmt(parseFloat(inf.gross_amount) || 0)}</span>
					</div>
					{#if iDiscountAmt > 0}
						<div class="pf-calc-row disc">
							<span>İndirim{inf.discount_type === 'rate' ? ` (%${inf.discount_value})` : ''}</span
							><span>-{fmt(iDiscountAmt)}</span>
						</div>
					{/if}
					<div class="pf-calc-row"><span>Net Tutar</span><span>{fmt(iNetAmt)}</span></div>
					<div class="pf-calc-row net">
						<span>Taksit başına ({inf.installments}×)</span><strong>{fmt(iPerInstallment)}</strong>
					</div>
				</div>
				<!-- Mini taksit önizlemesi -->
				<div class="pf-preview">
					<div class="pf-preview-header"><i class="bx bx-table"></i> Önizleme</div>
					{#each Array.from({ length: Math.min(parseInt(inf.installments) || 2, 5) }) as _, i}
						<div class="pf-preview-row">
							<span class="pf-pr-no">{i + 1}. Taksit</span>
							<span class="pf-pr-status">Beklemede</span>
							<span class="pf-pr-amt"
								>{fmt(
									i === (parseInt(inf.installments) || 2) - 1
										? Math.round(
												(iNetAmt - iPerInstallment * ((parseInt(inf.installments) || 2) - 1)) * 100
											) / 100
										: iPerInstallment
								)}</span
							>
						</div>
					{/each}
					{#if (parseInt(inf.installments) || 0) > 5}
						<div class="pf-preview-row pf-more">
							... ve {(parseInt(inf.installments) || 0) - 5} taksit daha
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if showSubmitButton}
		<div class="pf-footer">
			<button
				class="pf-save-btn"
				disabled={saving ||
					!inf.payment_type_id ||
					!inf.currency_id ||
					!inf.gross_amount ||
					parseInt(inf.installments) < 2}
				onclick={handleInstallment}
			>
				{#if saving}<i class="bx bx-loader-alt bx-spin"></i> Kaydediliyor…{:else}<i
						class="bx bx-check"
					></i> Plan Oluştur{/if}
			</button>
		</div>
	{/if}
{/if}

<style>
	/* ── Sekmeler ────────────────────────────────────────────────── */
	.pf-tabs {
		display: flex;
		gap: 4px;
		background: #f7f8fa;
		border-radius: 10px;
		padding: 4px;
		margin-bottom: 18px;
	}
	.pf-tab {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 14px;
		border: none;
		border-radius: 7px;
		background: transparent;
		color: #9aa3b0;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms;
		font-family: inherit;
	}
	.pf-tab.active {
		background: white;
		color: #f46481;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}
	.pf-tab i {
		font-size: 16px;
	}

	/* ── Form Grid ───────────────────────────────────────────────── */
	.pf-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.pf-grid.compact {
		grid-template-columns: 1fr;
	}
	.pf-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.pf-full {
		grid-column: 1 / -1;
	}
	.pf-label {
		font-size: 12px;
		font-weight: 600;
		color: #445471;
	}
	.req {
		color: #f5365c;
	}

	/* ── İndirim toggle ─────────────────────────────────────────── */
	.pf-discount-row {
		display: flex;
		gap: 7px;
		align-items: stretch;
	}
	.pf-discount-row > :last-child {
		flex: 1;
	}
	.pf-disc-toggle {
		display: flex;
		border: 1.5px solid #ebedf0;
		border-radius: 9px;
		overflow: hidden;
		background: #fafbfc;
		flex-shrink: 0;
	}
	.pf-disc-btn {
		padding: 0 12px;
		border: none;
		background: transparent;
		color: #9aa3b0;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 150ms;
		font-family: inherit;
	}
	.pf-disc-btn.active {
		background: #f46481;
		color: white;
	}

	/* ── Hesap özeti ─────────────────────────────────────────────── */
	.pf-calc {
		background: #f7f8fa;
		border-radius: 10px;
		padding: 11px 14px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		border: 1px solid #ebedf0;
	}
	.pf-calc-row {
		display: flex;
		justify-content: space-between;
		font-size: 12.5px;
		color: #6b7a99;
	}
	.pf-calc-row.disc {
		color: #f5365c;
	}
	.pf-calc-row.net {
		font-size: 13.5px;
		color: #1e2a3b;
		font-weight: 600;
		border-top: 1px solid #ebedf0;
		padding-top: 5px;
		margin-top: 2px;
	}

	/* ── Taksit önizleme ─────────────────────────────────────────── */
	.pf-preview {
		margin-top: 10px;
		border: 1px solid #ebedf0;
		border-radius: 9px;
		overflow: hidden;
	}
	.pf-preview-header {
		background: #f7f8fa;
		padding: 7px 12px;
		font-size: 11.5px;
		font-weight: 600;
		color: #9aa3b0;
		display: flex;
		align-items: center;
		gap: 5px;
		border-bottom: 1px solid #ebedf0;
	}
	.pf-preview-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 7px 12px;
		font-size: 12px;
		border-bottom: 1px solid #f5f6f8;
	}
	.pf-preview-row:last-child {
		border-bottom: none;
	}
	.pf-pr-no {
		color: #445471;
		font-weight: 500;
	}
	.pf-pr-status {
		font-size: 10.5px;
		font-weight: 700;
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
		padding: 2px 7px;
		border-radius: 20px;
	}
	.pf-pr-amt {
		font-weight: 700;
		color: #1e2a3b;
	}
	.pf-more {
		color: #b0b8c4;
		font-size: 11.5px;
		justify-content: center;
	}

	/* ── Footer / Buton ─────────────────────────────────────────── */
	.pf-footer {
		margin-top: 18px;
		display: flex;
		justify-content: flex-end;
	}
	.pf-save-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 9px 22px;
		border: none;
		border-radius: 8px;
		background: #f46481;
		color: white;
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(244, 100, 129, 0.3);
		transition: all 150ms;
		font-family: inherit;
	}
	.pf-save-btn:hover:not(:disabled) {
		background: #e85577;
		transform: translateY(-1px);
	}
	.pf-save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	.pf-save-btn i {
		font-size: 15px;
	}

	@media (max-width: 500px) {
		.pf-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
