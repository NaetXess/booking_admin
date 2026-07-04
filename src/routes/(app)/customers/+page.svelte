<script>
	import { onMount } from 'svelte';
	import { formatDate, initials, avatarColor, formatPhoneDisplay } from '@utils/function';
	import { Customer } from '@controllers/customer';
	import { BookingPlan } from '@controllers/booking_plan';
	import { Booking } from '@controllers/booking';
	import { sourceLabel } from '@constants/constant';
	import PhoneNumberInput from '@components/custom/PhoneNumberInput.svelte';
	import Card from '@components/Card.svelte';
	import Button from '@components/Button.svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';
	import PageHeader from '@components/PageHeader.svelte';

	let customers = $state([]);

	let loading = $state(true);

	let pageSize = $state(10);
	let currentPage = 1;

	// Detail / edit drawer
	let drawerOpen = $state(false);
	let drawerMode = $state('view'); // 'view' | 'edit' | 'create'
	let selectedCustomer = $state(null);

	// New/edit form
	let form = $state(emptyForm());

	function emptyForm() {
		return {
			name: '',
			phone1: '',
			phone1_country_code: '+90',
			phone2_country_code: '+90',
			phone2: '',
			mail: '',
			source: 1,
			verified: 0,
			active: 1
		};
	}

	// ─── Filtering / sorting / pagination ────────────────────────────────────
	let totalCount = $derived(customers.length);
	let activeCount = $derived(customers.filter((c) => c.active === 1).length);
	let verifiedCount = $derived(customers.filter((c) => c.verified === 1).length);
	let todayCount = $derived(
		customers.filter((c) => {
			if (!c.createdat) return false;
			const d = new Date(c.createdat);
			const now = new Date();
			return (
				d.getFullYear() === now.getFullYear() &&
				d.getMonth() === now.getMonth() &&
				d.getDate() === now.getDate()
			);
		}).length
	);

	// ─── Drawer helpers ───────────────────────────────────────────────────────
	function openView(customer) {
		selectedCustomer = customer;
		drawerMode = 'view';
		drawerOpen = true;
	}

	function openEdit(customer) {
		selectedCustomer = customer;
		form = {
			id: customer.id,
			name: customer.name ?? '',
			phone1: customer.phone1 ?? '',
			phone1_country_code:
				customer.phone1_country_code != '' ? customer.phone1_country_code : '+90',
			phone2: customer.phone2 ?? '',
			phone2_country_code:
				customer.phone2_country_code != '' ? customer.phone2_country_code : '+90',
			mail: customer.mail ?? '',
			source: customer.source,
			verified: customer.verified,
			active: customer.active
		};

		drawerMode = 'edit';
		drawerOpen = true;
	}

	function openCreate() {
		selectedCustomer = null;
		form = emptyForm();
		drawerMode = 'create';
		drawerOpen = true;
	}

	function closeDrawer() {
		drawerOpen = false;
	}

	// DELETE
	let showModal = $state(false);
	let selectedCustomerForDelete = $state();

	async function handleDeleteCustomer() {
		let res = await Customer.delete(selectedCustomerForDelete.id);

		if (res) {
			selectedCustomerForDelete = null;
			customers = customers.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	async function handleUpsert() {
		let obj = form;

		if (drawerMode === 'create') {
			let res = await Customer.create(obj);

			if (res && res.data?.id) {
				customers = [res.data, ...customers];
				closeDrawer();
			}
		} else {
			let res = await Customer.update(obj);
			if (res && res.data?.id) {
				customers = customers.map((c) => (c.id === res.data.id ? res.data : c));
				closeDrawer();
			}
		}
	}

	function safeFormatDate(val, param = 9) {
		if (!val) return '—';
		try {
			return formatDate(val, param);
		} catch {
			return val;
		}
	}

	// ── Static mock data (API ile değişecek) ─────────────────────────────────
	const staticBalance = { amount: 0, currency: '₺', note: 'Devre dışı' };

	// ── Detail modal (geçmiş & planlı randevular) ─────────────────────────────
	let detailModalOpen = $state(false);
	let detailCustomer = $state(null);
	let detailTab = $state('past');

	let detailLoading = $state(false);

	let plannedBookings = $state([]);
	let bookingHistory = $state([]);

	async function openDetailModal(customer, _detailTab) {
		detailLoading = true;
		plannedBookings = [];
		bookingHistory = [];

		detailCustomer = customer;
		detailTab = _detailTab ? _detailTab : 'past';
		detailModalOpen = true;
		await getBookingData(customer.id);

		detailLoading = false;
	}

	async function getBookingData(customerID) {
		let [res1, res2] = await Promise.all([
			Booking.getCustomerHistory(customerID),
			BookingPlan.getByCustomerId(customerID)
		]);

		bookingHistory = res1 ?? [];
		plannedBookings = res2 ?? [];
	}
	function closeDetailModal() {
		detailModalOpen = false;
	}

	// ── Balance modal ─────────────────────────────────────────────────────────
	let balanceModalOpen = $state(false);
	let balanceCustomer = $state(null);

	function openBalanceModal(customer) {
		balanceCustomer = customer;
		balanceModalOpen = true;
	}
	function closeBalanceModal() {
		balanceModalOpen = false;
	}

	async function getUsers() {
		let res = await Customer.getAll();

		if (res) {
			customers = res;
		}
	}

	onMount(init);

	async function init() {
		await getUsers();
		loading = false;
	}
</script>

<svelte:head>
	<title>Müşteriler | Xess Booking</title>
	<meta name="description" content="Şirketinize bağlı müşterileri yönetin." />
</svelte:head>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->

<PageHeader
	onclick={openCreate}
	title="Müşteriler"
	subTitle="Tüm müşterilerinizi buradan yönetebilirsiniz."
	btnTitle="Yeni Müşteri"
/>

<!-- Stats Row -->
<div class="stats-row mb-4">
	<div class="stat-card">
		<div class="stat-icon total"><i class="bx bx-group"></i></div>
		<div class="stat-body">
			<span class="stat-value">{totalCount}</span>
			<span class="stat-label">Toplam Müşteri</span>
		</div>
	</div>
	<div class="stat-card">
		<div class="stat-icon active"><i class="bx bx-check-circle"></i></div>
		<div class="stat-body">
			<span class="stat-value">{activeCount}</span>
			<span class="stat-label">Aktif</span>
		</div>
	</div>
	<div class="stat-card">
		<div class="stat-icon verified"><i class="bx bx-shield-quarter"></i></div>
		<div class="stat-body">
			<span class="stat-value">{verifiedCount}</span>
			<span class="stat-label">Doğrulanmış</span>
		</div>
	</div>
	<div class="stat-card">
		<div class="stat-icon today"><i class="bx bx-calendar-plus"></i></div>
		<div class="stat-body">
			<span class="stat-value">{todayCount}</span>
			<span class="stat-label">Bugün Eklenen</span>
		</div>
	</div>
</div>

<!-- Main card -->
<Card>
	<div class="data-table">
		<!-- Toolbar -->
		<div class="toolbar px-4 pt-4 pb-3">
			<div class="search-bar">
				<i class="bx bx-search-alt-2"></i>
				<input type="text" placeholder="İsim, telefon veya e-posta ara…" />
			</div>

			<div class="filters">
				<div class="table-filter">
					<span class="label">Durum</span>
					<select>
						<option value="all">Tümü</option>
						<option value="active">Aktif</option>
						<option value="inactive">Pasif</option>
					</select>
				</div>

				<div class="table-filter">
					<span class="label">Sırala</span>
					<select>
						<option value="newest">En Yeni</option>
						<option value="oldest">En Eski</option>
						<option value="az">A - Z</option>
						<option value="za">Z - A</option>
					</select>
				</div>

				<div class="pagination">
					<span class="pagination-item" class:disabled={currentPage === 1}>
						<i class="bx bx-left-arrow-alt"></i>
					</span>
					<!-- {#each pageNumbers as p}
						<span
							class="pagination-item"
							class:active={p === currentPage}
							on:click={() => (currentPage = p)}>{p}</span
						>
					{/each} -->
					<span class="pagination-item">
						<i class="bx bx-right-arrow-alt"></i>
					</span>
				</div>
			</div>
		</div>

		<!-- Table -->
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<span>Yükleniyor…</span>
			</div>
		{:else if customers.length === 0}
			<div class="empty-state">
				<i class="bx bx-user-x"></i>
				<p>Kayıt bulunamadı.</p>
			</div>
		{:else}
			<table class="table table-hover">
				<thead>
					<tr>
						<th><div class="p-2">Müşteri</div></th>
						<th><div class="p-2">Telefon</div></th>
						<th><div class="p-2">E-posta</div></th>
						<th><div class="p-2">Kaynak</div></th>
						<th><div class="p-2">Durum</div></th>
						<th><div class="p-2">Kayıt Tarihi</div></th>
						<th><div class="p-2">Randevular</div></th>
						<th><div class="p-2">Bakiye</div></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each customers as customer (customer.id)}
						<tr>
							<!-- Avatar + Name -->
							<td>
								<div class="p-2 customer-cell">
									<div class="avatar" style="background-color: {avatarColor(customer.name)}">
										{initials(customer.name).toUpperCase()}
									</div>
									<div class="customer-info">
										<span class="customer-name">{customer.name ?? '—'}</span>
										{#if customer.verified === 1}
											<span class="verified-tag"><i class="bx bx-check"></i> Doğrulandı</span>
										{/if}
									</div>
								</div>
							</td>
							<!-- Phone -->
							<td>
								<div class="p-2 phones">
									{#if customer.phone1}
										<a href="tel:{customer.phone1}" class="phone-link">
											<i class="bx bx-phone"></i>
											{formatPhoneDisplay(customer.phone1_country_code, customer.phone1)}
										</a>
									{/if}
									{#if customer.phone2}
										<a href="tel:{customer.phone2}" class="phone-link secondary">
											<i class="bx bx-phone-call"></i>
											{formatPhoneDisplay(customer.phone2_country_code, customer.phone2)}
										</a>
									{/if}
									{#if !customer.phone1 && !customer.phone2}
										<span class="muted">—</span>
									{/if}
								</div>
							</td>
							<!-- Mail -->
							<td>
								<div class="p-2">
									{#if customer.mail}
										<a href="mailto:{customer.mail}" class="mail-link">
											<i class="bx bx-envelope"></i>
											{customer.mail}
										</a>
									{:else}
										<span class="muted">—</span>
									{/if}
								</div>
							</td>
							<!-- Source -->
							<td>
								<div class="p-2">
									<span class="source-badge source-{customer.source}"
										>{sourceLabel(customer.source)}</span
									>
								</div>
							</td>
							<!-- Status -->
							<td>
								<div class="p-2">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="status-toggle {customer.active === 1 ? 'active' : 'inactive'}"
										title="Durumu değiştir"
									>
										{customer.active === 1 ? 'Aktif' : 'Pasif'}
									</span>
								</div>
							</td>
							<!-- Date -->
							<td>
								<div class="p-2 date-cell">{safeFormatDate(customer.createdat, 9)}</div>
							</td>
							<!-- Randevular -->
							<td>
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="p-2 appt-cell">
									<span
										class="appt-badge past"
										title="Geçmiş randevular"
										onclick={() => openDetailModal(customer, 'past')}
									>
										<i class="bx bx-history"></i>
										Geçmiş
									</span>
									<span
										class="appt-badge planned"
										title="Planlı randevular"
										onclick={() => openDetailModal(customer, 'planned')}
									>
										<i class="bx bx-calendar-check"></i>
										Planlı
									</span>
								</div>
							</td>
							<!-- Bakiye -->
							<td>
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="p-2">
									<span class="balance-badge" onclick={() => openBalanceModal(customer)}>
										<i class="bx bx-wallet-alt"></i>
										Geçici olarak devre dışı
										<!-- {staticBalance.amount}{staticBalance.currency} -->
									</span>
								</div>
							</td>
							<!-- Actions -->
							<td>
								<div class="p-2 table-row-tools">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<i class="bx bx-show view" title="Görüntüle" onclick={() => openView(customer)}
									></i>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<i class="bx bx-edit-alt edit" title="Düzenle" onclick={() => openEdit(customer)}
									></i>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<i
										class="bx bx-trash delete"
										title="Sil"
										onclick={() => {
											showModal = true;
											selectedCustomerForDelete = customer;
										}}
									></i>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<div class="table-footer px-4 py-3">
				<span class="result-info">
					{customers.length} kayıttan {(currentPage - 1) * pageSize + 1}–{Math.min(
						currentPage * pageSize,
						customers.length
					)} gösteriliyor
				</span>
				<div class="page-size-picker">
					<span class="label">Sayfa başı</span>
					<select bind:value={pageSize}>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>
		{/if}
	</div>
</Card>

<!-- ── Drawer Overlay ─────────────────────────────────────────────────────── -->
{#if drawerOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="drawer-overlay" onclick={closeDrawer}></div>
	<div class="drawer" class:open={drawerOpen}>
		<div class="drawer-header">
			<h6>
				{#if drawerMode === 'create'}
					Yeni Müşteri
				{:else if drawerMode === 'edit'}
					Müşteriyi Düzenle
				{:else}
					Müşteri Detayı
				{/if}
			</h6>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span class="drawer-close" onclick={closeDrawer}><i class="bx bx-x"></i></span>
		</div>

		<div class="drawer-body">
			{#if drawerMode === 'view' && selectedCustomer}
				<!-- View Mode -->
				<div class="view-avatar-wrap">
					<div class="view-avatar" style="background-color:{avatarColor(selectedCustomer.name)}">
						{initials(selectedCustomer.name).toUpperCase()}
					</div>
					<div class="view-name">{selectedCustomer.name ?? '—'}</div>
					{#if selectedCustomer.verified === 1}
						<span class="verified-tag large"><i class="bx bx-check"></i> Doğrulanmış</span>
					{/if}
				</div>

				<div class="detail-list">
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-phone"></i></span>
						<div>
							<div class="detail-label">Telefon 1</div>
							<div class="detail-value">
								{formatPhoneDisplay(
									selectedCustomer.phone1_country_code,
									selectedCustomer.phone1
								) ?? '—'}
							</div>
						</div>
					</div>
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-phone-call"></i></span>
						<div>
							<div class="detail-label">Telefon 2</div>
							<div class="detail-value">
								{formatPhoneDisplay(
									selectedCustomer.phone2_country_code,
									selectedCustomer.phone2
								) ?? '—'}
							</div>
						</div>
					</div>
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-envelope"></i></span>
						<div>
							<div class="detail-label">E-posta</div>
							<div class="detail-value">{selectedCustomer.mail ?? '—'}</div>
						</div>
					</div>
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-radar"></i></span>
						<div>
							<div class="detail-label">Kaynak</div>
							<div class="detail-value">{sourceLabel(selectedCustomer.source)}</div>
						</div>
					</div>
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-toggle-left"></i></span>
						<div>
							<div class="detail-label">Durum</div>
							<div class="detail-value">{selectedCustomer.active === 1 ? 'Aktif' : 'Pasif'}</div>
						</div>
					</div>
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-calendar"></i></span>
						<div>
							<div class="detail-label">Kayıt Tarihi</div>
							<div class="detail-value">{safeFormatDate(selectedCustomer.createdat, 10)}</div>
						</div>
					</div>
					<div class="detail-row">
						<span class="detail-icon"><i class="bx bx-revision"></i></span>
						<div>
							<div class="detail-label">Son Güncelleme</div>
							<div class="detail-value">{safeFormatDate(selectedCustomer.updatedat, 10)}</div>
						</div>
					</div>
				</div>

				<div class="drawer-actions mt-4">
					<button class="btn-secondary" onclick={() => openEdit(selectedCustomer)}>
						<i class="bx bx-edit-alt"></i> Düzenle
					</button>
				</div>
			{:else}
				<!-- Edit / Create Mode -->
				<div class="form-fields">
					<div class="form-group">
						<label for="f-name">Ad Soyad</label>
						<div class="input-wrap">
							<i class="bx bx-user"></i><input
								id="f-name"
								type="text"
								bind:value={form.name}
								placeholder="Ad Soyad"
							/>
						</div>
					</div>
					<div class="form-group">
						<label for="f-phone1">Telefon 1</label>
						<PhoneNumberInput
							id="f-phone"
							bind:phoneValue={form.phone1}
							bind:countryCode={form.phone1_country_code}
						/>
					</div>
					<div class="form-group">
						<label for="f-phone2">Telefon 2 <small>(opsiyonel)</small></label>

						<PhoneNumberInput
							id="f-phone"
							bind:phoneValue={form.phone2}
							bind:countryCode={form.phone2_country_code}
						/>
					</div>
					<div class="form-group">
						<label for="f-mail">E-posta</label>
						<div class="input-wrap">
							<i class="bx bx-envelope"></i><input
								id="f-mail"
								type="email"
								bind:value={form.mail}
								placeholder="ornek@mail.com"
							/>
						</div>
					</div>
					<div class="form-group">
						<div class="form-group">
							<label for="f-active">Durum</label>
							<select id="f-active" bind:value={form.active}>
								<option value={1}>Aktif</option>
								<option value={0}>Pasif</option>
							</select>
						</div>
					</div>
				</div>

				<div class="drawer-actions mt-4">
					<button class="btn-ghost" onclick={closeDrawer}>İptal</button>
					<button class="btn-primary" onclick={handleUpsert}>
						<i class="bx bx-check"></i>
						{drawerMode === 'create' ? 'Kaydet' : 'Güncelle'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- ── Detail Modal (Randevular) ──────────────────────────────────────────── -->
{#if detailModalOpen && detailCustomer}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeDetailModal}></div>
	<div class="modal-box">
		<div class="modal-header">
			<div class="modal-title-wrap">
				<div class="modal-avatar" style="background-color:{avatarColor(detailCustomer.name)}">
					{initials(detailCustomer.name).toUpperCase()}
				</div>
				<div>
					<div class="modal-title">{detailCustomer.name ?? '—'}</div>
					<div class="modal-subtitle">Randevu Geçmişi</div>
				</div>
			</div>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span class="modal-close" onclick={closeDetailModal}><i class="bx bx-x"></i></span>
		</div>

		<div class="modal-tabs">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="modal-tab"
				class:active={detailTab === 'past'}
				onclick={() => (detailTab = 'past')}
			>
				<i class="bx bx-history"></i> Geçmiş Randevular
				<span class="tab-count">{bookingHistory.length}</span>
			</span>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="modal-tab"
				class:active={detailTab === 'planned'}
				onclick={() => (detailTab = 'planned')}
			>
				<i class="bx bx-calendar-check"></i> Planlı Randevular
				<span class="tab-count planned">{plannedBookings.length}</span>
			</span>
		</div>

		<div class="modal-body">
			{#if detailTab === 'past'}
				{#if detailLoading}
					<div class="modal-empty">Yükleniyor..</div>
				{:else if bookingHistory.length === 0}
					<div class="modal-empty">
						<i class="bx bx-calendar-x"></i>
						<p>Geçmiş randevu yok.</p>
					</div>
				{:else}
					<div class="appt-list">
						{#each bookingHistory as appt}
							<div class="appt-item">
								<div class="appt-dot past"></div>
								<div class="appt-content">
									<div class="appt-service">{appt.service_name}</div>
									<div class="appt-date"><i class="bx bx-calendar"></i> {appt.checkin_date}</div>
									{#if appt.description}<div class="appt-note">💬 {appt.description}</div>{/if}
								</div>
								<span class="appt-status-badge done">Tamamlandı</span>
							</div>
						{/each}
					</div>
				{/if}
			{:else if detailLoading}
				<div class="modal-empty">Yükleniyor..</div>
			{:else if plannedBookings.length === 0}
				<div class="modal-empty">
					<i class="bx bx-calendar-x"></i>
					<p>Planlı randevu yok.</p>
				</div>
			{:else}
				<div class="appt-list">
					{#each plannedBookings as appt}
						<div class="appt-item">
							<div class="appt-dot planned"></div>
							<div class="appt-content">
								<div class="appt-service">{appt.name}</div>
								<div class="appt-date">
									<i class="bx bx-calendar"></i>
									{safeFormatDate(appt.upcoming_date)}
								</div>
								<div class="appt-remaining">
									<div class="remaining-bar">
										<div
											class="remaining-fill"
											style="width:{Math.round(
												((appt.total_occurrences - appt.remaining_occurrences) /
													appt.total_occurrences) *
													100
											)}%"
										></div>
									</div>
									<span
										>Kalan: <strong>{appt.remaining_occurrences}</strong> / {appt.total_occurrences}
										seans</span
									>
								</div>
								{#if appt.notes}<div class="appt-note">💬 {appt.notes}</div>{/if}
							</div>
							<span class="appt-status-badge upcoming">Yaklaşıyor</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- ── Balance Modal ───────────────────────────────────────────────────────── -->
{#if balanceModalOpen && balanceCustomer}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeBalanceModal}></div>
	<div class="modal-box balance-modal">
		<div class="modal-header">
			<div class="modal-title-wrap">
				<div class="balance-icon-wrap"><i class="bx bx-wallet-alt"></i></div>
				<div>
					<div class="modal-title">{balanceCustomer.name ?? '—'}</div>
					<div class="modal-subtitle">Açık Bakiye</div>
				</div>
			</div>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span class="modal-close" onclick={closeBalanceModal}><i class="bx bx-x"></i></span>
		</div>
		<div class="modal-body">
			<div class="balance-amount-card">
				<div class="balance-label">Toplam Açık Bakiye</div>
				<div class="balance-amount">{staticBalance.amount} {staticBalance.currency}</div>
				{#if staticBalance.note}
					<div class="balance-note"><i class="bx bx-info-circle"></i> {staticBalance.note}</div>
				{/if}
			</div>
			<div class="balance-footer">
				<button class="btn-ghost" onclick={closeBalanceModal}>Kapat</button>
				<button class="btn-primary"><i class="bx bx-check"></i> Ödeme Al</button>
			</div>
		</div>
	</div>
{/if}

<Modal bind:show={showModal} title="Müşteri Silme">
	<Confirmation
		boldWord={selectedCustomerForDelete.name}
		text={`müşterisini silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedCustomerForDelete = null;
		}}
		on:confirm={handleDeleteCustomer}
	/>
</Modal>

<style>
	/* ── Stats ──────────────────────────────────────────────────────────── */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}

	@media (max-width: 900px) {
		.stats-row {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.stat-card {
		background: white;
		border-radius: 10px;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
		padding: 18px 20px;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22px;
		flex-shrink: 0;
	}
	.stat-icon.total {
		background: rgba(245, 54, 92, 0.12);
		color: #f5365c;
	}
	.stat-icon.active {
		background: rgba(45, 206, 137, 0.15);
		color: #2dce89;
	}
	.stat-icon.verified {
		background: rgba(94, 114, 228, 0.15);
		color: #5e72e4;
	}
	.stat-icon.today {
		background: rgba(251, 99, 64, 0.15);
		color: #fb6340;
	}

	.stat-body {
		display: flex;
		flex-direction: column;
	}
	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #1a1a2e;
		line-height: 1;
	}
	.stat-label {
		font-size: 12px;
		color: #999;
		margin-top: 4px;
	}

	/* ── Toolbar ────────────────────────────────────────────────────────── */
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.search-bar {
		height: 40px;
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 200px;
	}
	.search-bar i {
		font-size: 22px;
		color: rgb(150, 150, 150);
	}
	.search-bar input {
		border: none;
		outline: none;
		font-size: 15px;
		color: rgb(60, 60, 60);
		background: transparent;
		width: 100%;
	}
	.search-bar input::placeholder {
		color: rgb(180, 180, 180);
	}

	.filters {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
	}

	.table-filter {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.label {
		color: rgb(150, 150, 150);
		font-size: 13px;
	}

	select {
		border: 1px solid rgb(210, 210, 210);
		border-radius: 8px;
		padding: 4px 8px;
		color: rgb(73, 73, 73);
		font-size: 13px;
		cursor: pointer;
		outline: none;
	}

	/* ── Pagination ─────────────────────────────────────────────────────── */
	.pagination {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.pagination-item {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid rgb(200, 200, 200);
		display: flex;
		justify-content: center;
		align-items: center;
		color: rgb(150, 150, 150);
		cursor: pointer;
		box-shadow: 0 0 6px -2px rgba(0, 0, 0, 0.2);
		transition: transform 150ms ease;
		font-size: 13px;
		user-select: none;
	}
	.pagination-item:hover {
		transform: scale(1.08);
	}
	.pagination-item.active {
		background: rgba(245, 54, 92, 0.8);
		color: white;
		border: none;
	}
	.pagination-item.disabled {
		opacity: 0.35;
		pointer-events: none;
	}
	.pagination-item i {
		font-size: 16px;
	}

	/* ── Table ──────────────────────────────────────────────────────────── */
	.customer-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 13px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.customer-info {
		display: flex;
		flex-direction: column;
	}
	.customer-name {
		font-weight: 600;
		font-size: 14px;
		color: #333;
	}

	.verified-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 10px;
		color: #2dce89;
		font-weight: 600;
	}
	.verified-tag.large {
		font-size: 13px;
		margin-top: 4px;
	}

	.phones {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.phone-link,
	.mail-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		color: #555;
		text-decoration: none;
		transition: color 150ms;
	}
	.phone-link:hover,
	.mail-link:hover {
		color: #f5365c;
	}
	.phone-link.secondary {
		color: #999;
		font-size: 12px;
	}
	.muted {
		color: #bbb;
		font-size: 13px;
	}

	.source-badge {
		padding: 3px 10px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
	}
	.source-1 {
		background: rgba(94, 114, 228, 0.12);
		color: #5e72e4;
	}
	.source-2 {
		background: rgba(245, 54, 92, 0.12);
		color: #f5365c;
	}
	.source-3 {
		background: rgba(251, 99, 64, 0.12);
		color: #fb6340;
	}
	.source-4 {
		background: rgba(45, 206, 137, 0.12);
		color: #2dce89;
	}
	.source-5 {
		background: rgba(150, 150, 150, 0.12);
		color: #888;
	}

	.status-toggle {
		display: inline-flex;
		align-items: center;
		padding: 3px 12px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		user-select: none;
		transition:
			transform 120ms,
			opacity 120ms;
	}
	.status-toggle:hover {
		transform: scale(1.05);
		opacity: 0.85;
	}
	.status-toggle.active {
		background: rgba(45, 206, 137, 0.15);
		color: #2dce89;
	}
	.status-toggle.inactive {
		background: rgba(245, 54, 92, 0.12);
		color: #f5365c;
	}

	.date-cell {
		font-size: 13px;
		color: #888;
	}

	.table-row-tools {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.table-row-tools i {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		cursor: pointer;
		transition:
			background 150ms,
			color 150ms,
			transform 120ms;
		color: #aaa;
	}
	.table-row-tools i:hover {
		transform: scale(1.1);
	}
	.table-row-tools .view:hover {
		background: rgba(94, 114, 228, 0.1);
		color: #5e72e4;
	}
	.table-row-tools .edit:hover {
		background: rgba(251, 99, 64, 0.1);
		color: #fb6340;
	}
	.table-row-tools .delete:hover {
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
	}

	/* ── Footer ─────────────────────────────────────────────────────────── */
	.table-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}
	.result-info {
		font-size: 13px;
		color: #aaa;
	}
	.page-size-picker {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* ── Loading / Empty ─────────────────────────────────────────────────── */
	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		gap: 12px;
		color: #bbb;
	}
	.empty-state i {
		font-size: 48px;
	}
	.empty-state p {
		font-size: 15px;
		margin: 0;
	}

	.spinner {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(245, 54, 92, 0.2);
		border-top-color: #f5365c;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Drawer ──────────────────────────────────────────────────────────── */
	.drawer-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.25);
		z-index: 900;
		animation: fadeIn 200ms ease;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		width: 380px;
		height: 100vh;
		background: white;
		z-index: 901;
		display: flex;
		flex-direction: column;
		box-shadow: -4px 0 30px rgba(0, 0, 0, 0.12);
		transform: translateX(100%);
		transition: transform 230ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	.drawer.open {
		transform: translateX(0);
	}

	.drawer-header {
		padding: 20px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}
	.drawer-header h6 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #333;
	}
	.drawer-close {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: #aaa;
		cursor: pointer;
		transition:
			background 150ms,
			color 150ms;
	}
	.drawer-close:hover {
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	/* View mode */
	.view-avatar-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin-bottom: 28px;
	}
	.view-avatar {
		width: 72px;
		height: 72px;
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 26px;
		font-weight: 700;
	}
	.view-name {
		font-size: 20px;
		font-weight: 700;
		color: #222;
	}

	.detail-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.detail-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px;
		border-radius: 10px;
		background: #fafafa;
	}
	.detail-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 17px;
		flex-shrink: 0;
	}
	.detail-label {
		font-size: 11px;
		color: #aaa;
		margin-bottom: 2px;
	}
	.detail-value {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	/* Edit / Create form */
	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.form-group label {
		font-size: 12px;
		color: #888;
		font-weight: 600;
	}
	.form-row-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		border: 1px solid rgb(220, 220, 220);
		border-radius: 8px;
		padding: 8px 12px;
		transition: border-color 150ms;
	}
	.input-wrap:focus-within {
		border-color: #f5365c;
	}
	.input-wrap i {
		font-size: 17px;
		color: #bbb;
		flex-shrink: 0;
	}
	.input-wrap input {
		border: none;
		outline: none;
		width: 100%;
		font-size: 14px;
		color: #333;
		background: transparent;
	}
	.form-group select {
		border: 1px solid rgb(220, 220, 220);
		border-radius: 8px;
		padding: 9px 12px;
		font-size: 14px;
		color: #333;
		width: 100%;
	}

	/* Drawer action buttons */
	.drawer-actions {
		display: flex;
		gap: 10px;
	}
	.btn-primary,
	.btn-secondary,
	.btn-ghost {
		flex: 1;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border: none;
		transition:
			opacity 150ms,
			transform 120ms;
	}
	.btn-primary:hover,
	.btn-secondary:hover,
	.btn-ghost:hover {
		opacity: 0.88;
		transform: scale(1.02);
	}
	.btn-primary {
		background: #f5365c;
		color: white;
	}
	.btn-secondary {
		background: rgba(251, 99, 64, 0.12);
		color: #fb6340;
	}
	.btn-ghost {
		background: rgba(0, 0, 0, 0.05);
		color: #666;
	}
	/* ── Appointment column cells ───────────────────────────────────────── */
	.appt-cell {
		display: flex;
		gap: 6px;
		cursor: pointer;
	}
	.appt-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 9px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		transition: transform 120ms;
	}
	.appt-badge:hover {
		transform: scale(1.07);
	}
	.appt-badge.past {
		background: rgba(94, 114, 228, 0.12);
		color: #5e72e4;
	}
	.appt-badge.planned {
		background: rgba(45, 206, 137, 0.12);
		color: #2dce89;
	}

	.balance-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 10px;
		border-radius: 20px;
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		transition:
			transform 120ms,
			background 150ms;
	}
	.balance-badge:hover {
		transform: scale(1.07);
		background: rgba(245, 54, 92, 0.18);
	}

	/* ── Shared Modal ────────────────────────────────────────────────────── */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 950;
		animation: fadeIn 180ms ease;
	}
	.modal-box {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(540px, 95vw);
		max-height: 80vh;
		border-radius: 14px;
		background: white;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
		z-index: 951;
		display: flex;
		flex-direction: column;
		animation: popIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes popIn {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px 16px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.07);
	}
	.modal-title-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.modal-avatar {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 16px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.modal-title {
		font-size: 16px;
		font-weight: 700;
		color: #222;
	}
	.modal-subtitle {
		font-size: 12px;
		color: #aaa;
	}
	.modal-close {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: #aaa;
		cursor: pointer;
		transition:
			background 150ms,
			color 150ms;
	}
	.modal-close:hover {
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
	}

	/* ── Tabs ────────────────────────────────────────────────────────────── */
	.modal-tabs {
		display: flex;
		gap: 0;
		padding: 0 24px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.07);
	}
	.modal-tab {
		padding: 12px 16px;
		font-size: 13px;
		font-weight: 600;
		color: #aaa;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		display: flex;
		align-items: center;
		gap: 6px;
		transition:
			color 150ms,
			border-color 150ms;
	}
	.modal-tab:hover {
		color: #555;
	}
	.modal-tab.active {
		color: #f5365c;
		border-bottom-color: #f5365c;
	}
	.tab-count {
		background: rgba(94, 114, 228, 0.12);
		color: #5e72e4;
		border-radius: 20px;
		padding: 1px 7px;
		font-size: 11px;
	}
	.tab-count.planned {
		background: rgba(45, 206, 137, 0.12);
		color: #2dce89;
	}

	/* ── Modal body ──────────────────────────────────────────────────────── */
	.modal-body {
		overflow-y: auto;
		padding: 20px 24px;
		flex: 1;
	}
	.modal-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 40px 0;
		color: #ccc;
	}
	.modal-empty i {
		font-size: 40px;
	}
	.modal-empty p {
		font-size: 14px;
		margin: 0;
	}

	/* ── Appointment list ────────────────────────────────────────────────── */
	.appt-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.appt-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px;
		border-radius: 10px;
		background: #fafafa;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}
	.appt-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-top: 5px;
		flex-shrink: 0;
	}
	.appt-dot.past {
		background: #5e72e4;
	}
	.appt-dot.planned {
		background: #2dce89;
	}
	.appt-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.appt-service {
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}
	.appt-date {
		font-size: 12px;
		color: #999;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.appt-note {
		font-size: 12px;
		color: #888;
		font-style: italic;
	}
	.appt-status-badge {
		padding: 3px 10px;
		border-radius: 20px;
		font-size: 10px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.appt-status-badge.done {
		background: rgba(45, 206, 137, 0.12);
		color: #2dce89;
	}
	.appt-status-badge.upcoming {
		background: rgba(94, 114, 228, 0.12);
		color: #5e72e4;
	}

	/* ── Remaining bar ───────────────────────────────────────────────────── */
	.appt-remaining {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 6px;
	}
	.remaining-bar {
		width: 90px;
		height: 5px;
		border-radius: 3px;
		background: rgba(0, 0, 0, 0.08);
		overflow: hidden;
		flex-shrink: 0;
	}
	.remaining-fill {
		height: 100%;
		background: #2dce89;
		border-radius: 3px;
	}
	.appt-remaining span {
		font-size: 12px;
		color: #888;
	}
	.appt-remaining strong {
		color: #2dce89;
	}

	/* ── Balance modal specifics ─────────────────────────────────────────── */
	.balance-modal {
		max-height: unset;
	}
	.balance-icon-wrap {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		flex-shrink: 0;
	}
	.balance-amount-card {
		text-align: center;
		padding: 28px 16px;
		background: linear-gradient(135deg, rgba(245, 54, 92, 0.06) 0%, rgba(245, 54, 92, 0.02) 100%);
		border-radius: 12px;
		margin-bottom: 20px;
		border: 1px solid rgba(245, 54, 92, 0.1);
	}
	.balance-label {
		font-size: 12px;
		color: #aaa;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.balance-amount {
		font-size: 40px;
		font-weight: 800;
		color: #f5365c;
		line-height: 1;
	}
	.balance-note {
		margin-top: 12px;
		font-size: 13px;
		color: #888;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
	}
	.balance-footer {
		display: flex;
		gap: 10px;
	}
</style>
