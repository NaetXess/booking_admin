<script>
	import { onMount } from 'svelte';
	import { Company } from '@controllers/company';
	import { toastCustom } from '@utils/function';
	import Input from '@components/Input.svelte';
	import { CompanyStats } from '@controllers/company_stats';
	import { goto } from '$app/navigation';

	// ── Form state ────────────────────────────────────────────
	let loading = false;
	let saving = false;
	let company = null;

	let form = {
		name: '',
		email: '',
		phone: '',
		address: '',
		description: ''
	};

	let stats = {
		totalDepartments: 0,
		totalServices: 0,
		totalUsers: 0,
		totalBookings: 0
	};

	// Track original values to show dirty state
	let original = { ...form };
	$: isDirty = JSON.stringify(form) !== JSON.stringify(original);

	async function getStats() {
		let res = await CompanyStats.getTotalStats();
		if (res) {
			stats.totalBookings = res.total_bookings || 0;
			stats.totalDepartments = res.total_departments || 0;
			stats.totalUsers = res.total_users || 0;
			stats.totalServices = res.total_services || 0;
		}
	}

	// ── Save ──────────────────────────────────────────────────
	async function handleSave() {
		if (!isDirty || saving) return;

		let data = {
			name: form.name,
			email: form.email,
			phone1: form.phone,
			address: form.address,
			description: form.description
		};

		saving = true;
		const result = await Company.update(data);
		saving = false;

		if (result !== false) {
			original = { ...form };
			toastCustom('Firma bilgileri kaydedildi.', 1);
		} else {
			toastCustom('Kayıt sırasında bir hata oluştu.', 2);
		}
	}

	// ── Helpers ───────────────────────────────────────────────
	function getInitials(name) {
		if (!name) return '?';
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	}
	// ── Load ──────────────────────────────────────────────────
	onMount(async () => {
		loading = true;
		const data = await Company.getUserCompany();
		if (data) {
			company = data;
			form = {
				name: data.name ?? '',
				email: data.email ?? '',
				phone: data.phone1 ?? '',
				address: data.address ?? '',
				description: data.description ?? ''
			};
			original = { ...form };
		}
		loading = false;

		getStats();
	});
</script>

<svelte:head>
	<title>Firma | Xess Booking</title>
	<meta name="description" content="Şirketinizin genel parametrelerini düzenleyin." />
</svelte:head>

<!-- ── Header ──────────────────────────────────────────────── -->
<div class="page-header">
	<div>
		<h5 class="page-title">Firma Bilgileri</h5>
		<p class="page-sub">Firmanıza ait temel bilgileri buradan düzenleyebilirsiniz.</p>
	</div>

	<div class="d-flex gap-3">
		<button class="qa-btn qa-secondary" on:click={() => goto('/company/params')}>
			<i class="bx bx-cog"></i> Parametreler
		</button>
		<button
			class="save-btn"
			class:save-btn--active={isDirty}
			disabled={!isDirty || saving}
			on:click={handleSave}
		>
			{#if saving}
				<i class="bx bx-loader-alt bx-spin"></i> Kaydediliyor…
			{:else}
				<i class="bx bx-save"></i> Kaydet
			{/if}
		</button>
	</div>
</div>

<!-- ── Main Grid ───────────────────────────────────────────── -->
<div class="firma-grid">
	<!-- LEFT — Form -->
	<div class="form-card">
		<div class="form-section-title">
			<i class="bx bx-buildings"></i> Genel Bilgiler
		</div>

		{#if loading}
			<div class="skeleton-group">
				{#each [1, 2, 3, 4, 5] as _}
					<div class="skeleton-field">
						<div class="skeleton-label"></div>
						<div class="skeleton-input"></div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="form-grid">
				<div class="field">
					<label for="f-name">Firma Adı</label>
					<div class="input-wrap">
						<Input
							id="f-name"
							type="text"
							placeholder="Xess Booking Ltd."
							icon="bx-store"
							bind:value={form.name}
						/>
					</div>
				</div>

				<div class="field">
					<label for="f-email">E-posta</label>
					<div class="input-wrap">
						<Input
							id="f-email"
							type="email"
							icon="bx-envelope"
							placeholder="info@firma.com"
							bind:value={form.email}
						/>
					</div>
				</div>

				<div class="field">
					<label for="f-phone">Telefon</label>
					<div class="input-wrap">
						<Input
							id="f-phone"
							type="text"
							icon="bx-phone"
							placeholder="+90 5xx xxx xx xx"
							bind:value={form.phone}
						/>
					</div>
				</div>

				<div class="field field--full">
					<label for="f-address">Adres</label>
					<div class="input-wrap input-wrap--textarea">
						<Input
							id="f-address"
							type="textarea"
							icon="bx-map"
							placeholder="Firma adresinizi girin…"
							bind:value={form.address}
						/>
					</div>
				</div>

				<div class="field field--full">
					<label for="f-desc">Açıklama / Hakkında</label>
					<div class="input-wrap input-wrap--textarea">
						<Input
							id="f-desc"
							type="textarea"
							icon="bx-info-circle"
							placeholder="Firmanıza kısa bir açıklama ekleyin…"
							bind:value={form.description}
						/>
					</div>
				</div>
			</div>

			{#if isDirty}
				<div class="unsaved-hint">
					<i class="bx bx-error-circle"></i>
					Kaydedilmemiş değişiklikler var.
				</div>
			{/if}
		{/if}
	</div>

	<!-- RIGHT — Summary Panel -->
	<div class="summary-col">
		<!-- Avatar card -->
		<div class="summary-card profile-card">
			<div class="company-avatar">
				{getInitials(form.name || company?.name)}
			</div>
			<div class="company-name">{form.name || company?.name || '—'}</div>
			<div class="company-email">{form.email || company?.email || '—'}</div>
			<div class="status-badge {company?.active ? 'badge-active' : 'badge-passive'}">
				<i class="bx {company?.active ? 'bx-check-circle' : 'bx-x-circle'}"></i>
				{company?.active ? 'Aktif' : 'Pasif'}
			</div>
		</div>

		<!-- Info card -->
		<div class="summary-card info-card">
			<div class="info-row">
				<i class="bx bx-phone"></i>
				<span>{form.phone || '—'}</span>
			</div>
			<div class="info-row">
				<i class="bx bx-envelope"></i>
				<span>{form.email || '—'}</span>
			</div>
			{#if company?.createdat}
				<div class="info-row">
					<i class="bx bx-calendar"></i>
					<span>
						{new Date(company.createdat).toLocaleDateString('tr-TR', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})} tarihinden itibaren
					</span>
				</div>
			{/if}
		</div>

		<!-- Stats card -->
		<div class="summary-card stats-card">
			<div class="stats-title">Hızlı İstatistikler</div>
			<div class="stats-grid">
				<div class="stat-item">
					<div class="stat-icon" style="background: rgba(245,54,92,0.1); color: #f5365c">
						<i class="bx bx-store"></i>
					</div>
					<div class="stat-value">{stats.totalDepartments || '-'}</div>
					<div class="stat-label">Departman</div>
				</div>
				<div class="stat-item">
					<div class="stat-icon" style="background: rgba(17,205,239,0.1); color: #11cdef">
						<i class="bx bx-alarm"></i>
					</div>
					<div class="stat-value">{stats.totalServices || '-'}</div>
					<div class="stat-label">Hizmet</div>
				</div>
				<div class="stat-item">
					<div class="stat-icon" style="background: rgba(45,206,137,0.1); color: #2dce89">
						<i class="bx bx-spreadsheet"></i>
					</div>
					<div class="stat-value">{stats.totalUsers || '-'}</div>
					<div class="stat-label">Kullanıcı</div>
				</div>
				<div class="stat-item">
					<div class="stat-icon" style="background: rgba(251,99,64,0.1); color: #fb6340">
						<i class="bx bx-calendar-event"></i>
					</div>
					<div class="stat-value">{stats.totalBookings || '-'}</div>
					<div class="stat-label">Rezervasyon</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.qa-btn {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 8px 16px;
		border-radius: 8px;
		border: none;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition:
			transform 100ms ease,
			box-shadow 100ms ease;
	}

	.qa-secondary {
		background: white;
		color: #445471;
		border: 1px solid #e0e4ec;
	}
	.qa-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	/* ── Header ─────────────────────────────────────────────── */
	.page-header {
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

	/* ── Save Button ─────────────────────────────────────────── */
	.save-btn {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 9px 20px;
		border-radius: 8px;
		border: 1.5px solid #dde1ea;
		background: white;
		color: #b0b8c4;
		font-size: 13px;
		font-weight: 600;
		cursor: not-allowed;
		transition: all 150ms ease;
	}
	.save-btn i {
		font-size: 16px;
	}
	.save-btn--active {
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
		border-color: transparent;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(245, 54, 92, 0.35);
	}
	.save-btn--active:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(245, 54, 92, 0.45);
	}

	/* ── Grid ────────────────────────────────────────────────── */
	.firma-grid {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 20px;
		align-items: start;
	}

	/* ── Form Card ───────────────────────────────────────────── */
	.form-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
		padding: 24px;
	}
	.form-section-title {
		font-size: 13px;
		font-weight: 700;
		color: #9aa3b0;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		display: flex;
		align-items: center;
		gap: 7px;
		margin-bottom: 20px;
		padding-bottom: 14px;
		border-bottom: 1px solid #f0f2f5;
	}
	.form-section-title i {
		font-size: 16px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}
	.field--full {
		grid-column: 1 / -1;
	}

	.field label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #7a8699;
		margin-bottom: 7px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* Input icon wrapper */
	.input-wrap {
		position: relative;
	}
	.input-wrap > i {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 16px;
		color: #b0b8c4;
		pointer-events: none;
		z-index: 1;
	}
	.input-wrap--textarea > i {
		top: 14px;
		transform: none;
	}
	/* Override Input component to add left padding */
	.input-wrap :global(.form-control) {
		padding-left: 36px !important;
		border: 1.5px solid #ebedf0;
		border-radius: 8px;
		font-size: 13px;
		color: #445471;
		background: #f7f8fa;
		transition:
			border-color 150ms,
			background 150ms;
	}
	.input-wrap :global(.form-control:focus) {
		border-color: #f5365c;
		background: white;
		outline: none;
		box-shadow: 0 0 0 3px rgba(245, 54, 92, 0.1);
	}
	.input-wrap :global(textarea.form-control) {
		resize: vertical;
		min-height: 90px;
	}

	/* Unsaved hint */
	.unsaved-hint {
		margin-top: 16px;
		padding: 10px 14px;
		background: rgba(251, 99, 64, 0.07);
		border: 1px solid rgba(251, 99, 64, 0.2);
		border-radius: 8px;
		font-size: 12px;
		color: #fb6340;
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.unsaved-hint i {
		font-size: 15px;
	}

	/* ── Skeleton ────────────────────────────────────────────── */
	.skeleton-group {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.skeleton-field {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.skeleton-label {
		width: 80px;
		height: 12px;
		background: #ebedf0;
		border-radius: 4px;
		animation: pulse 1.4s ease infinite;
	}
	.skeleton-input {
		height: 40px;
		background: #f0f2f5;
		border-radius: 8px;
		animation: pulse 1.4s ease infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* ── Summary Column ──────────────────────────────────────── */
	.summary-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.summary-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
		padding: 20px;
	}

	/* Profile card */
	.profile-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 8px;
	}
	.company-avatar {
		width: 72px;
		height: 72px;
		border-radius: 18px;
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
		font-size: 24px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 16px rgba(245, 54, 92, 0.35);
		margin-bottom: 4px;
	}
	.company-name {
		font-size: 15px;
		font-weight: 700;
		color: #252c38;
	}
	.company-email {
		font-size: 12px;
		color: #9aa3b0;
	}
	.status-badge {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		margin-top: 4px;
	}
	.badge-active {
		background: rgba(45, 206, 137, 0.12);
		color: #2dce89;
	}
	.badge-passive {
		background: rgba(251, 99, 64, 0.12);
		color: #fb6340;
	}

	/* Info card */
	.info-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.info-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 13px;
		color: #445471;
	}
	.info-row i {
		font-size: 16px;
		color: #b0b8c4;
		flex-shrink: 0;
		margin-top: 1px;
	}

	/* Stats card */
	.stats-title {
		font-size: 12px;
		font-weight: 700;
		color: #9aa3b0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 14px;
	}
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 10px 6px;
		border-radius: 10px;
		background: #f7f8fa;
	}
	.stat-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.stat-icon i {
		font-size: 18px;
	}
	.stat-value {
		font-size: 16px;
		font-weight: 700;
		color: #252c38;
	}
	.stat-label {
		font-size: 11px;
		color: #9aa3b0;
	}

	/* ── Responsive ──────────────────────────────────────────── */
	@media (max-width: 900px) {
		.firma-grid {
			grid-template-columns: 1fr;
		}
		.summary-col {
			order: -1;
		}
		.form-grid {
			grid-template-columns: 1fr;
		}
		.field--full {
			grid-column: auto;
		}
	}
</style>
