<script>
	import { onMount } from 'svelte';
	import { Booking } from '@controllers/booking';
	import { Search } from '@controllers/search';
	import {
		formatDate,
		formatPhoneDisplay,
		getCookie,
		closeDropdown,
		debounce
	} from '@utils/function';

	import Button from '@components/Button.svelte';
	import Dropdown from '@components/Dropdown.svelte';
	import Badge from '@components/Badge.svelte';
	import { goto } from '$app/navigation';
	import Card from '@components/Card.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';
	import ReservationDetailModal from '@components/custom/reservation/ReservationDetails.svelte';

	let bookings = [];
	let paginationData = loadDefaultPagination();
	let loading = false;
	let filteredBookingData = [];

	// QueryParams
	let page = 1;
	let pageSize = 10;

	let order = 'desc';
	let sort = 'createdat';

	function loadDefaultPagination() {
		return {
			items: [],
			total_rows: 0,
			page: 1,
			limit: 0,
			total_pages: 0
		};
	}

	function loadPageParams() {
		return {
			page,
			page_size: pageSize,
			order,
			sort
		};
	}

	const sortingItems = [
		{
			id: 1,
			name: 'Oluşturma Tarihi - En Yeni',
			value: 'createdat:desc'
		},
		{
			id: 2,
			name: 'Oluşturma Tarihi - En Eski',
			value: 'createdat:asc'
		}
	];

	// qu --> quick updater variable
	let quActive = 1;

	let selectedBooking;
	// DELETE
	let showModal = false;

	async function handleDeleteBooking() {
		let res = await Booking.delete(selectedBooking.id);
		if (res) {
			selectedBooking = null;
			bookings = bookings.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}
	// Details
	let modalOpen = false;

	function openDetailModal(reservation) {
		selectedBooking = reservation;
		modalOpen = true;
	}

	function closeDetailModal(e) {
		selectedBooking = null;
	}

	async function handlePagination(params) {
		try {
			loading = true;

			paginationData = await Booking.getAllByCompanyId({
				page: params.page,
				page_size: params.page_size,
				order: params.order,
				sort: params.sort
			});

			bookings = paginationData?.items ?? [];
			filteredBookingData = bookings;
		} finally {
			loading = false;
		}
	}
	const searchBookings = debounce(async (searchText) => {
		if (searchText?.length < 2) {
			filteredBookingData = bookings;
			return;
		}

		let res = await Search.search({ index: 'bookings', search_text: searchText });

		filteredBookingData = res;
	}, 300);

	// Init
	onMount(async () => {
		handlePagination({ page: page, page_size: pageSize, order, sort });
	});
</script>

<svelte:head>
	<title>Rezervasyonlar | Xess Booking</title>
	<meta name="description" content="Şirketinize ait randevuları yönetin." />
</svelte:head>

<PageHeader
	title="Rezervasyonlar"
	subTitle="Tüm rezervasyonları buradan yönetebilirsiniz."
	url="/reservations/create/new"
	btnTitle="Yeni Rezervasyon"
/>

<Card>
	<DataTable
		{sortingItems}
		data={paginationData}
		on:pagination={(e) => {
			page = e.detail.page;
			handlePagination(loadPageParams());
		}}
		on:pageSize={(e) => {
			pageSize = e.detail.page_size;
			handlePagination(loadPageParams());
		}}
		on:sort={(e) => {
			order = e.detail.order;
			sort = e.detail.sort;
			handlePagination(loadPageParams());
		}}
		on:search={(e) => {
			searchBookings(e.detail.search_text);
		}}
	>
		<table>
			<thead>
				<tr>
					<th>Müşteri</th>
					<th class="text-center">Randevu Tarihi</th>
					<th class="text-center">Randevu Saati</th>
					<th>Aldığı Hizmet</th>
					<th>Durum</th>
					<th class="text-center">Oluşturulma Tarihi</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#if loading}
					<tr>
						<td colspan="7" style="padding: 0;">
							<div class="empty-row">
								<!-- İçindeki div flex oldu -->
								<i class="bx bx-loader-alt bx-spin"></i>
								Yükleniyor…
							</div>
						</td>
					</tr>
				{:else if filteredBookingData && filteredBookingData.length > 0}
					{#each filteredBookingData as booking}
						{@const customerName = booking.customer?.name
							? booking.customer.name
							: booking.customer_name}
						{@const countryCode = booking.customer?.country_code
							? booking.customer.country_code
							: booking.customer_country_code}
						{@const customerPhone = booking.customer?.phone
							? booking.customer.phone
							: booking.customer_phone}
						{@const customerMail = booking.customer?.mail
							? booking.customer.mail
							: booking.customer_mail}
						<tr>
							<td>
								<div class="customer-cell">
									<div class="avatar {booking.booking_plan_id ? 'blue' : 'red'}">
										{customerName
											?.split(' ')
											.map((w) => w[0])
											.join('')
											.slice(0, 2) ?? '?'}
									</div>

									<div class="d-flex flex-column">
										<span class="bold">{customerName}</span>
										<span
											>{formatPhoneDisplay(countryCode, customerPhone) || '-'} / {customerMail}</span
										>
									</div>
								</div>
							</td>
							<td class="text-center">{formatDate(booking.checkin_date, 9)}</td>
							<td class="text-center"
								><Badge theme="green">{booking.checkin_time.slice(0, 5)}</Badge></td
							>
							<td>{booking.service_name}</td>
							<td>
								{#if booking.status == 0}
									<Badge danger>Pasif</Badge>
								{:else if booking.status == 1}
									<Badge primary>Aktif</Badge>
								{/if}

								<!-- <Dropdown dropup id="quick-updater-dropdown-{booking.id}">
									{#if booking.status == 0}
										<Badge
											danger
											dropdown
											on:click={() => {
												quActive = 1;
											}}>Pasif</Badge
										>
									{:else if booking.status == 1}
										<Badge
											primary
											dropdown
											on:click={() => {
												quActive = 0;
											}}>Aktif</Badge
										>
									{/if}

									<div slot="menu">
										<div class="tools px-3">
											<button
												class="danger"
												on:click={() => closeDropdown(`quick-updater-dropdown-${booking.id}`)}
											>
												<i class="bx bx-x"></i>
											</button>
											<button class="primary">
												<i class="bx bx-check"></i>
											</button>
										</div>
										<div class="body change-unit-active text-center mt-4 px-3">
											<div class="d-flex justify-content-center mb-3">
												{#if quActive == 0}
													<button
														class="active-status-selection danger"
														on:click={() => {
															quActive = 1;
														}}>Pasif</button
													>
												{:else if quActive == 1}
													<button
														class="active-status-selection primary"
														on:click={() => {
															quActive = 0;
														}}>Aktif</button
													>
												{/if}
											</div>
											<small class="info">
												*Bu kaydın aktiflik durumunu
												{#if quActive == 1}<span class="primary">aktif</span
													>{:else if quActive == 0}<span class="danger">pasif</span>{/if}
												olarak günceller.
											</small>
										</div>
									</div>
								</Dropdown> -->
							</td>
							<td class="text-center">{formatDate(booking.createdat, 9)}</td>
							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span class="action-btn view" on:click={() => openDetailModal(booking)}>
										<i class="bx bx-show"></i>
									</span>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span
										class="action-btn link"
										on:click={() => window.open(`/booking/${booking.id}`, '_blank')}
									>
										<i class="bx bx-link-alt"></i>
									</span>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span
										class="action-btn edit"
										on:click={() => goto(`reservations/update/${booking.id}`)}
									>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span
										class="action-btn delete"
										on:click={() => {
											showModal = true;
											selectedBooking = booking;
										}}
									>
										<i class="bx bx-trash"></i>
									</span>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="7" style="padding: 0;">
							<div class="empty-row">
								<i class="bx bx-calendar-x"></i>
								Henüz rezervasyon bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<Modal bind:show={showModal} title="Rezervasyon Silme">
	<Confirmation
		text={`Rezervasyonu silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedBooking = null;
		}}
		on:confirm={handleDeleteBooking}
	/>
</Modal>
<ReservationDetailModal
	bind:show={modalOpen}
	reservation={selectedBooking}
	on:edit={(e) => goto(`/reservations/update/${e.detail.id}`)}
	on:close={() => console.log('kapatıldı')}
/>

<style>
	/* ─── Table ───────────────────────────────────────────────── */
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
	tbody td {
		padding: 13px 16px;
		font-size: 13px;
		color: #445471;
		vertical-align: middle;
	}

	/* ─── Customer Cell ───────────────────────────────────────── */
	.customer-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;

		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.avatar.red {
		background: linear-gradient(135deg, #f5365c, #f4226d);
	}

	.avatar.blue {
		background: linear-gradient(135deg, #0ea5e9, #42b4e9);
	}

	/* ─── Contact Cell ────────────────────────────────────────── */
	.contact-cell {
		display: flex;
		align-items: center;
		gap: 5px;
		color: #7a8699;
	}
	.contact-cell i {
		font-size: 14px;
		color: #b0b8c4;
	}

	/* ─── Description ─────────────────────────────────────────── */
	.description-cell {
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #9aa3b0;
		font-size: 12px;
	}

	/* ─── Empty / Loading Row ─────────────────────────────────── */
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
		font-size: 20px;
	}
</style>
