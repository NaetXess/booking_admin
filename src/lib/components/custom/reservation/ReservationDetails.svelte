<script>
	import { createEventDispatcher } from 'svelte';
	import { initials as getInitials } from '@utils/function';

	export let show = false;
	export let reservation = null;

	const dispatch = createEventDispatcher();

	const statusMap = {
		0: { label: 'Bekliyor', icon: 'bx-time', cls: 'status-pending' },
		1: { label: 'Onaylandı', icon: 'bx-check-circle', cls: 'status-confirmed' },
		2: { label: 'Tamamlandı', icon: 'bx-check-double', cls: 'status-completed' },
		3: { label: 'İptal', icon: 'bx-x-circle', cls: 'status-cancelled' }
	};

	$: statusInfo = reservation ? statusMap[reservation.status] ?? statusMap[0] : statusMap[0];

	// checkin_date + checkin_time → okunabilir tarih
	$: formattedDate = (() => {
		if (!reservation?.checkin_date) return '—';
		try {
			const d = new Date(reservation.checkin_date);
			return d.toLocaleDateString('tr-TR', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return reservation.checkin_date;
		}
	})();

	// "14:30:00" → "14:30"
	$: checkinTime = reservation?.checkin_time?.slice(0, 5) ?? '—';
	$: checkoutTime = reservation?.checkout_time?.slice(0, 5) ?? '—';

	// Süre hesaplama (dakika cinsinden)
	$: durationMin = (() => {
		if (!reservation?.checkin_time || !reservation?.checkout_time) return null;
		try {
			const [h1, m1] = reservation.checkin_time.split(':').map(Number);
			const [h2, m2] = reservation.checkout_time.split(':').map(Number);
			const diff = h2 * 60 + m2 - (h1 * 60 + m1);
			return diff > 0 ? diff : null;
		} catch {
			return null;
		}
	})();

	// Telefon: ülke kodu + numara birleştir
	$: fullPhone = (() => {
		if (!reservation?.customer_phone && !reservation?.customer.phone) return null;
		const code = reservation.customer.country_code || reservation.customer_country_code;
		return code
			? `${code} ${reservation.customer.phone || reservation.customer_phone}`
			: reservation.customer.phone || reservation.customer_phone;
	})();

	// İsim baş harfleri
	$: initials = getInitials(reservation?.customer.name || reservation?.customer_name);

	// Kayıt tarihi
	$: createdLabel = (() => {
		if (!reservation?.createdat) return null;
		try {
			return new Date(reservation.createdat).toLocaleString('tr-TR', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return null;
		}
	})();

	function close() {
		show = false;
		dispatch('close');
	}

	function handleEdit() {
		dispatch('edit', reservation);
		close();
	}

	function handleCancel() {
		dispatch('cancel', reservation);
	}

	function handleBackdrop(e) {
		if (e.target === e.currentTarget) close();
	}
</script>

{#if show && reservation}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="rdm-backdrop" on:click={handleBackdrop}>
		<div class="rdm-modal">
			<!-- ── Header ─────────────────────────────────────────────── -->
			<div class="rdm-header">
				<div class="rdm-header-left">
					<div class="rdm-avatar">{initials}</div>
					<div class="rdm-header-info">
						<h6 class="rdm-customer-name">
							{(reservation.customer.name || reservation.customer_name) ?? '—'}
						</h6>
						<div class="rdm-contact-row">
							{#if fullPhone}
								<a
									class="rdm-contact-link"
									href="tel:{reservation.customer.phone || reservation.customer_phone}"
								>
									<i class="bx bx-phone"></i>
									{fullPhone}
								</a>
							{/if}
							{#if reservation.customer_mail}
								<a
									class="rdm-contact-link"
									href="mailto:{reservation.customer.mail || reservation.customer_mail}"
								>
									<i class="bx bx-envelope"></i>
									{reservation.customer.mail || reservation.customer_mail}
								</a>
							{/if}
						</div>
					</div>
				</div>
				<div class="rdm-header-right">
					<span class="rdm-status-badge {statusInfo.cls}">
						<i class="bx {statusInfo.icon}"></i>
						{statusInfo.label}
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span class="rdm-close" on:click={close}><i class="bx bx-x"></i></span>
				</div>
			</div>

			<!-- ── Tarih Bandı ─────────────────────────────────────────── -->
			<div class="rdm-date-banner">
				<div class="rdm-date-item">
					<i class="bx bx-calendar-event"></i>
					<div>
						<span class="rdm-date-label">Tarih</span>
						<span class="rdm-date-value">{formattedDate}</span>
					</div>
				</div>
				<div class="rdm-date-divider"></div>
				<div class="rdm-date-item">
					<i class="bx bx-time-five"></i>
					<div>
						<span class="rdm-date-label">Giriş / Çıkış</span>
						<span class="rdm-date-value">{checkinTime} – {checkoutTime}</span>
					</div>
				</div>
				{#if durationMin}
					<div class="rdm-date-divider"></div>
					<div class="rdm-date-item">
						<i class="bx bx-stopwatch"></i>
						<div>
							<span class="rdm-date-label">Süre</span>
							<span class="rdm-date-value">{durationMin} dk</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- ── Detaylar ────────────────────────────────────────────── -->
			<div class="rdm-body">
				<div class="rdm-section">
					{#if reservation.service_name}
						<div class="rdm-detail-row">
							<span class="rdm-detail-icon"><i class="bx bx-spa"></i></span>
							<div>
								<div class="rdm-detail-label">Hizmet</div>
								<div class="rdm-detail-value">
									{reservation.service_name}
								</div>
							</div>
						</div>
					{/if}
					{#if reservation.resource}
						<div class="rdm-detail-row">
							<span class="rdm-detail-icon"><i class="bx bx-user"></i></span>
							<div>
								<div class="rdm-detail-label">
									{reservation.resource.type == 1 ? 'Personel' : ''}
								</div>
								<div class="rdm-detail-value">
									{reservation.resource.name}
								</div>
							</div>
						</div>
					{/if}

					{#if reservation.department_name}
						<div class="rdm-detail-row">
							<span class="rdm-detail-icon"><i class="bx bx-buildings"></i></span>
							<div>
								<div class="rdm-detail-label">Departman</div>
								<div class="rdm-detail-value">{reservation.department_name}</div>
							</div>
						</div>
					{/if}

					{#if reservation.resource_name}
						<div class="rdm-detail-row">
							<span class="rdm-detail-icon"><i class="bx bx-user-check"></i></span>
							<div>
								<div class="rdm-detail-label">Personel / Kaynak</div>
								<div class="rdm-detail-value">{reservation.resource_name}</div>
							</div>
						</div>
					{/if}

					{#if createdLabel}
						<div class="rdm-detail-row">
							<span class="rdm-detail-icon"><i class="bx bx-calendar-plus"></i></span>
							<div>
								<div class="rdm-detail-label">Kayıt Tarihi</div>
								<div class="rdm-detail-value">{createdLabel}</div>
							</div>
						</div>
					{/if}

					{#if reservation.timezone}
						<div class="rdm-detail-row">
							<span class="rdm-detail-icon"><i class="bx bx-world"></i></span>
							<div>
								<div class="rdm-detail-label">Zaman Dilimi</div>
								<div class="rdm-detail-value">{reservation.timezone}</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Planlı Rezervasyon Bandı (opsiyonel) -->
				{#if reservation.plan_name}
					<div class="rdm-plan-box">
						<div class="rdm-plan-icon"><i class="bx bx-revision"></i></div>
						<div class="rdm-plan-info">
							<div class="rdm-plan-label">Planlı Paket</div>
							<div class="rdm-plan-name">{reservation.plan_name}</div>
						</div>
						{#if reservation.occurrence_index && reservation.total_occurrences}
							<div class="rdm-plan-progress">
								<span class="rdm-plan-count">
									{reservation.occurrence_index} / {reservation.total_occurrences}
								</span>
								<div class="rdm-plan-bar">
									<div
										class="rdm-plan-bar-fill"
										style="width: {(reservation.occurrence_index / reservation.total_occurrences) *
											100}%"
									></div>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Notlar / Açıklama -->
				{#if reservation.description}
					<div class="rdm-notes">
						<i class="bx bx-note rdm-notes-icon"></i>
						<span>{reservation.description}</span>
					</div>
				{/if}
			</div>

			<!-- ── Footer ─────────────────────────────────────────────── -->
			<div class="rdm-footer">
				<button class="rdm-btn-cancel" on:click={handleCancel} disabled={reservation.status === 3}>
					<i class="bx bx-x-circle"></i>
					İptal Et
				</button>
				<div class="rdm-footer-right">
					<button class="rdm-btn-secondary" on:click={close}>Kapat</button>
					<button class="rdm-btn-primary" on:click={handleEdit}>
						<i class="bx bx-edit-alt"></i>
						Düzenle
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ── Backdrop ─────────────────────────────────────────────────── */
	.rdm-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1050;
		background: rgba(17, 24, 39, 0.45);
		backdrop-filter: blur(3px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		animation: rdm-fade-in 0.18s ease;
	}

	@keyframes rdm-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ── Modal Shell ──────────────────────────────────────────────── */
	.rdm-modal {
		background: #ffffff;
		border-radius: 16px;
		width: 100%;
		max-width: 520px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.15),
			0 4px 16px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		animation: rdm-slide-up 0.22s cubic-bezier(0.34, 1.36, 0.64, 1);
	}

	@keyframes rdm-slide-up {
		from {
			transform: translateY(24px) scale(0.97);
			opacity: 0;
		}
		to {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}

	/* ── Header ───────────────────────────────────────────────────── */
	.rdm-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 20px 16px 20px;
		border-bottom: 1px solid #f1f3f5;
		gap: 12px;
	}

	.rdm-header-left {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
	}

	.rdm-avatar {
		flex-shrink: 0;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f5365c, #f5a623);
		color: #fff;
		font-weight: 700;
		font-size: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		letter-spacing: 0.5px;
	}

	.rdm-header-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.rdm-customer-name {
		margin: 0;
		font-size: 15px;
		font-weight: 700;
		color: #1a202c;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rdm-contact-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.rdm-contact-link {
		font-size: 12px;
		color: #6b7280;
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 3px;
		transition: color 0.15s;
	}

	.rdm-contact-link:hover {
		color: #f5365c;
	}

	.rdm-header-right {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	/* Status badge */
	.rdm-status-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
	}

	.status-pending {
		background: #fff8e1;
		color: #c17b00;
	}
	.status-confirmed {
		background: #e8f5e9;
		color: #2e7d32;
	}
	.status-completed {
		background: #e3f2fd;
		color: #1565c0;
	}
	.status-cancelled {
		background: #fce4ec;
		color: #b71c1c;
	}

	.rdm-close {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #9ca3af;
		font-size: 20px;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.rdm-close:hover {
		background: #f3f4f6;
		color: #374151;
	}

	/* ── Tarih Bandı ──────────────────────────────────────────────── */
	.rdm-date-banner {
		display: flex;
		align-items: center;
		padding: 14px 20px;
		background: linear-gradient(135deg, #fff5f6 0%, #fff9f0 100%);
		border-bottom: 1px solid #f1f3f5;
	}

	.rdm-date-item {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
	}

	.rdm-date-item > i {
		font-size: 22px;
		color: #f5365c;
		flex-shrink: 0;
	}

	.rdm-date-label {
		display: block;
		font-size: 10.5px;
		font-weight: 600;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.rdm-date-value {
		display: block;
		font-size: 13px;
		font-weight: 700;
		color: #1a202c;
		margin-top: 2px;
	}

	.rdm-date-divider {
		width: 1px;
		height: 36px;
		background: #e5e7eb;
		margin: 0 16px;
		flex-shrink: 0;
	}

	/* ── Body ─────────────────────────────────────────────────────── */
	.rdm-body {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.rdm-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.rdm-detail-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.rdm-detail-icon {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: #f5365c;
		font-size: 16px;
	}

	.rdm-detail-label {
		font-size: 11px;
		font-weight: 600;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.rdm-detail-value {
		font-size: 14px;
		font-weight: 600;
		color: #1a202c;
		margin-top: 3px;
	}

	/* Plan kutusu */
	.rdm-plan-box {
		display: flex;
		align-items: center;
		gap: 12px;
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-left: 4px solid #f5365c;
		border-radius: 10px;
		padding: 12px 14px;
	}

	.rdm-plan-icon {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: rgba(245, 54, 92, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #f5365c;
		font-size: 18px;
		flex-shrink: 0;
	}

	.rdm-plan-info {
		flex: 1;
		min-width: 0;
	}

	.rdm-plan-label {
		font-size: 10.5px;
		font-weight: 600;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.rdm-plan-name {
		font-size: 13px;
		font-weight: 700;
		color: #1a202c;
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rdm-plan-progress {
		flex-shrink: 0;
		text-align: right;
	}

	.rdm-plan-count {
		font-size: 13px;
		font-weight: 700;
		color: #f5365c;
		display: block;
		margin-bottom: 4px;
	}

	.rdm-plan-bar {
		width: 72px;
		height: 5px;
		background: #e9ecef;
		border-radius: 99px;
		overflow: hidden;
	}

	.rdm-plan-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #f5365c, #f5a623);
		border-radius: 99px;
		transition: width 0.4s ease;
	}

	/* Notlar */
	.rdm-notes {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		background: #fffbf0;
		border: 1px solid #fde8b0;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 13px;
		color: #7a6530;
		line-height: 1.5;
	}

	.rdm-notes-icon {
		font-size: 16px;
		flex-shrink: 0;
		margin-top: 1px;
		color: #c17b00;
	}

	/* ── Footer ───────────────────────────────────────────────────── */
	.rdm-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 20px;
		border-top: 1px solid #f1f3f5;
		gap: 10px;
	}

	.rdm-footer-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.rdm-footer button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 9px 16px;
		border-radius: 8px;
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: all 0.18s ease;
	}

	.rdm-btn-cancel {
		background: transparent;
		color: #ef4444;
		border: 1px solid #fca5a5 !important;
	}

	.rdm-btn-cancel:hover:not(:disabled) {
		background: #fef2f2;
		border-color: #ef4444 !important;
	}

	.rdm-btn-cancel:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.rdm-btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.rdm-btn-secondary:hover {
		background: #e5e7eb;
	}

	.rdm-btn-primary {
		background: #f5365c;
		color: #ffffff;
		box-shadow: 0 4px 6px rgba(245, 54, 92, 0.2);
	}

	.rdm-btn-primary:hover {
		background: #e0284e;
		box-shadow: 0 6px 10px rgba(245, 54, 92, 0.3);
		transform: translateY(-1px);
	}

	/* ── Responsive ───────────────────────────────────────────────── */
	@media (max-width: 540px) {
		.rdm-date-banner {
			flex-wrap: wrap;
			gap: 12px;
		}
		.rdm-date-divider {
			display: none;
		}
		.rdm-date-item {
			flex: none;
			width: calc(50% - 6px);
		}
		.rdm-footer {
			flex-direction: column;
			align-items: stretch;
		}
		.rdm-footer-right {
			justify-content: flex-end;
		}
		.rdm-btn-cancel {
			justify-content: center;
		}
	}
</style>
