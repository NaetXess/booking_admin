<script>
	import { onMount } from 'svelte';
	import { Booking } from '@controllers/booking';
	import { page } from '$app/stores';
	import { formatDate } from '@utils/function';

	let booking = null;
	let loading = true;
	let notFound = false;
	let copied = false;

	const statusConfig = {
		0: { label: 'Pasif', color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
		1: { label: 'Aktif', color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
		2: { label: 'Beklemede', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
		3: { label: 'Tamamlandı', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' }
	};

	let status = statusConfig[1];

	onMount(async () => {
		const id = $page.params.id;
		const data = await Booking.getSummary(id);
		if (data) {
			booking = data;
			status = statusConfig[booking.status] ?? statusConfig[1];
		} else {
			notFound = true;
		}
		loading = false;
	});

	function copyLink() {
		navigator.clipboard.writeText(window.location.href).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	function formatPhone(phone) {
		return phone || '-';
	}
</script>

<svelte:head>
	<title>{booking ? `${booking.customer_name} · Rezervasyon` : 'Rezervasyon Detayı'}</title>
	<meta name="description" content="Rezervasyon detay sayfası" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page-bg">
	<div class="page-center">
		<!-- ── Header brand ── -->
		<div class="top-brand">
			<div class="brand-logo">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" />
					<line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
					<line x1="9" y1="15" x2="15" y2="15" />
				</svg>
			</div>
			<span class="brand-text">Rezervasyon Sistemi</span>
		</div>

		{#if loading}
			<!-- Skeleton -->
			<div class="receipt">
				<div class="receipt-head skeleton-head"></div>
				<div class="receipt-body">
					<div class="sk-line w70"></div>
					<div class="sk-line w50 mt8"></div>
					<div class="sk-line w85 mt20"></div>
					<div class="sk-line w60 mt8"></div>
					<div class="sk-line w75 mt8"></div>
				</div>
			</div>
		{:else if notFound}
			<div class="receipt notfound-card">
				<div class="nf-icon">
					<svg
						width="44"
						height="44"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#ff7a30"
						stroke-width="1.5"
						stroke-linecap="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<circle cx="12" cy="16" r="0.5" fill="#ff7a30" />
					</svg>
				</div>
				<h2 class="nf-title">Rezervasyon Bulunamadı</h2>
				<p class="nf-desc">Bu bağlantı geçersiz veya rezervasyon kaldırılmış olabilir.</p>
			</div>
		{:else}
			<div class="receipt" class:slide-in={!loading}>
				<!-- Colored header stripe -->
				<div class="receipt-head">
					<div class="head-content">
						<div class="receipt-icon">
							<svg
								width="26"
								height="26"
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
								<line x1="9" y1="15" x2="15" y2="15" />
							</svg>
						</div>
						<div>
							<p class="head-label">REZERVASYON</p>
							<p class="head-id">#{booking.id?.slice(0, 6).toUpperCase()}</p>
						</div>
					</div>

					<!-- Status badge -->
					<div class="status-pill" style="background:{status.bg}; color:{status.color};">
						<span class="status-dot" style="background:{status.dot};"></span>
						{status.label}
					</div>
				</div>

				<!-- Perforated divider -->
				<div class="perforation">
					<div class="perf-circle left"></div>
					<div class="perf-dashes"></div>
					<div class="perf-circle right"></div>
				</div>

				<!-- Customer section -->
				<div class="receipt-body">
					<div class="customer-row">
						<div class="cust-avatar">
							{booking.customer_name?.charAt(0)?.toUpperCase() ?? '?'}
						</div>
						<div class="cust-info">
							<p class="cust-name">{booking.customer_name}</p>
							<p class="cust-phone">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									><path
										d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.65 3.25 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16l.5.92z"
									/></svg
								>
								{formatPhone(booking.customer_phone)}
							</p>
						</div>
					</div>

					<div class="section-title">Hizmet Detayı</div>
					<div class="details-list">
						{#if booking.service_name}
							<div class="detail-row">
								<span class="d-label">Hizmet</span>
								<span class="d-value"
									>{booking.department_name ? booking.department_name + ' - ' : ''}
									{booking.service_name}</span
								>
							</div>
						{/if}
						{#if booking.resource_name}
							<div class="detail-row">
								<span class="d-label">Personel</span>
								<span class="d-value">{booking.resource_name}</span>
							</div>
						{/if}
						{#if booking.checkin_date && booking.checkin_time}
							<div class="detail-row">
								<span class="d-label">Tarih / Saat</span>
								<span class="d-value accent"
									>{formatDate(booking.checkin_date, 9) ?? ''}
									{booking.checkin_time?.slice(0, 5) ?? ''}</span
								>
							</div>
						{/if}
					</div>

					{#if booking.description}
						<div class="note-box">
							<p class="note-label">Not</p>
							<p class="note-text">{booking.description}</p>
						</div>
					{/if}
				</div>

				<!-- Bottom perforated divider -->
				<div class="perforation">
					<div class="perf-circle left"></div>
					<div class="perf-dashes"></div>
					<div class="perf-circle right"></div>
				</div>

				<!-- Footer actions -->
				<div class="receipt-footer">
					<p class="footer-hint">Bu sayfanın linkini paylaşabilirsiniz</p>
					<button class="copy-btn" class:copied on:click={copyLink}>
						{#if copied}
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"><polyline points="20 6 9 17 4 12" /></svg
							>
							Kopyalandı
						{:else}
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path
									d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
								/></svg
							>
							Linki Kopyala
						{/if}
					</button>
				</div>
			</div>
		{/if}

		<p class="page-footer">© {new Date().getFullYear()} Rezervasyon Yönetim Sistemi</p>
	</div>
</div>

<style>
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: 'Poppins', sans-serif;
		background: #f0f2f5;
	}

	/* ── Page background ── */
	.page-bg {
		min-height: 100vh;
		background: #f0f2f5;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px 16px;
	}

	.page-center {
		width: 100%;
		max-width: 440px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
	}

	/* ── Brand header ── */
	.top-brand {
		display: flex;
		align-items: center;
		gap: 9px;
		color: #555;
		font-size: 13.5px;
		font-weight: 600;
	}
	.brand-logo {
		width: 34px;
		height: 34px;
		border-radius: 10px;
		background: linear-gradient(145deg, #ff7a30, #ec1f67);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 12px rgba(255, 122, 48, 0.35);
	}
	.brand-text {
		color: #444;
		letter-spacing: 0.2px;
	}

	/* ── Receipt card ── */
	.receipt {
		width: 100%;
		background: #ffffff;
		border-radius: 20px;
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.04),
			0 10px 40px rgba(0, 0, 0, 0.09);
		overflow: visible;
		animation: fadeSlide 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes fadeSlide {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Receipt colored head ── */
	.receipt-head {
		background: linear-gradient(135deg, #ff7a30 0%, #ec1f67 100%);
		border-radius: 20px 20px 0 0;
		padding: 24px 26px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.head-content {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.receipt-icon {
		width: 46px;
		height: 46px;
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.head-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 1.5px;
		color: rgba(255, 255, 255, 0.75);
	}
	.head-id {
		font-size: 20px;
		font-weight: 700;
		color: #fff;
		line-height: 1.1;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 100px;
		font-size: 11.5px;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		display: inline-block;
		flex-shrink: 0;
	}

	/* ── Perforation divider ── */
	.perforation {
		display: flex;
		align-items: center;
		position: relative;
		height: 0;
	}
	.perf-circle {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #f0f2f5;
		flex-shrink: 0;
		position: relative;
		z-index: 2;
	}
	.perf-circle.left {
		margin-left: -10px;
	}
	.perf-circle.right {
		margin-right: -10px;
	}
	.perf-dashes {
		flex: 1;
		border-top: 2px dashed #e5e7eb;
		margin: 0 4px;
	}

	/* ── Receipt body ── */
	.receipt-body {
		padding: 26px 26px 20px;
	}

	.customer-row {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 22px;
	}
	.cust-avatar {
		width: 52px;
		height: 52px;
		border-radius: 16px;
		background: linear-gradient(135deg, #ff7a30, #ec1f67);
		color: #fff;
		font-size: 22px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 4px 14px rgba(255, 122, 48, 0.3);
	}
	.cust-name {
		font-size: 17px;
		font-weight: 700;
		color: #1a1a1a;
		line-height: 1.2;
	}
	.cust-phone {
		font-size: 12.5px;
		color: #888;
		margin-top: 4px;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.section-title {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 1.4px;
		color: #bbb;
		text-transform: uppercase;
		margin-bottom: 12px;
	}

	.details-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid #f3f4f6;
		border-radius: 14px;
		overflow: hidden;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		gap: 12px;
		border-bottom: 1px solid #f3f4f6;
		transition: background 0.15s;
	}
	.detail-row:last-child {
		border-bottom: none;
	}
	.detail-row:hover {
		background: #fafafa;
	}

	.d-label {
		font-size: 12.5px;
		color: #9ca3af;
		font-weight: 500;
		flex-shrink: 0;
	}
	.d-value {
		font-size: 13px;
		font-weight: 600;
		color: #1f2937;
		text-align: right;
	}
	.d-value.accent {
		color: #ff7a30;
	}

	.note-box {
		margin-top: 16px;
		background: #fff8f5;
		border: 1px solid #ffe0cc;
		border-radius: 12px;
		padding: 14px 16px;
	}
	.note-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 1.2px;
		color: #ff7a30;
		text-transform: uppercase;
		margin-bottom: 6px;
	}
	.note-text {
		font-size: 13px;
		color: #555;
		line-height: 1.6;
	}

	/* ── Footer ── */
	.receipt-footer {
		padding: 18px 26px 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.footer-hint {
		font-size: 11.5px;
		color: #bbb;
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 9px 18px;
		border-radius: 100px;
		border: none;
		cursor: pointer;
		font-family: 'Poppins', sans-serif;
		font-size: 12.5px;
		font-weight: 600;
		background: linear-gradient(135deg, #ff7a30, #ec1f67);
		color: #fff;
		box-shadow: 0 4px 14px rgba(255, 122, 48, 0.35);
		transition:
			transform 0.15s,
			box-shadow 0.15s,
			opacity 0.15s;
	}
	.copy-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(255, 122, 48, 0.45);
	}
	.copy-btn:active {
		transform: scale(0.97);
	}
	.copy-btn.copied {
		background: linear-gradient(135deg, #22c55e, #16a34a);
		box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
	}

	/* ── Not found ── */
	.notfound-card {
		text-align: center;
		padding: 48px 32px;
	}
	.nf-icon {
		margin-bottom: 16px;
	}
	.nf-title {
		font-size: 18px;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 8px;
	}
	.nf-desc {
		font-size: 13.5px;
		color: #9ca3af;
		line-height: 1.6;
	}

	/* ── Loading skeleton ── */
	.skeleton-head {
		height: 100px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
		border-radius: 20px 20px 0 0;
	}
	.receipt-body .sk-line {
		height: 13px;
		border-radius: 6px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
	}
	.w50 {
		width: 50%;
	}
	.w60 {
		width: 60%;
	}
	.w70 {
		width: 70%;
	}
	.w75 {
		width: 75%;
	}
	.w85 {
		width: 85%;
	}
	.mt8 {
		margin-top: 8px;
	}
	.mt20 {
		margin-top: 20px;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* ── Page footer ── */
	.page-footer {
		font-size: 11.5px;
		color: #bbb;
		text-align: center;
	}
</style>
