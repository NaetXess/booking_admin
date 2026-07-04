<script>
	import { onMount } from 'svelte';
	import { BookingPlan } from '@controllers/booking_plan';
	import { formatDate, getCookie, closeDropdown } from '@utils/function';

	import Button from '@components/Button.svelte';
	import Dropdown from '@components/Dropdown.svelte';
	import Badge from '@components/Badge.svelte';
	import { goto } from '$app/navigation';
	import Card from '@components/Card.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';

	let bookingPlans = $state([]);
	let loading = $state(false);

	// qu --> quick updater variable
	let quActive = 1;

	// DELETE
	let showModal = $state(false);
	let selectedBooking = $state();

	async function handleDeletePlan() {
		let res = await BookingPlan.delete(selectedBooking.id);
		if (res) {
			selectedBooking = null;
			bookingPlans = bookingPlans.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	onMount(init);

	async function init() {
		loading = true;

		let promises = [];
		promises.push(BookingPlan.getAll());

		const [bookingData] = await Promise.allSettled(promises);
		bookingPlans = bookingData.status == 'fulfilled' ? bookingData.value : [];

		loading = false;
	}
</script>

<svelte:head>
	<title>Planlı Randevular | Xess Booking</title>
	<meta name="description" content="Şirketinize ait randevuları yönetin." />
</svelte:head>

<PageHeader
	title="Randevu Planları"
	subTitle="Randevu planlarınızı buradan yönetebilirsiniz."
	url="/reservation-plans/create/new"
	btnTitle="Yeni Plan"
/>

<Card>
	<DataTable data={bookingPlans}>
		<table>
			<thead>
				<tr>
					<th>Müşteri</th>
					<th>İletişim</th>
					<th>Aldığı Hizmet</th>
					<th>Seans Durumu</th>
					<th>Durum</th>
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
				{:else if bookingPlans && bookingPlans.length > 0}
					{#each bookingPlans as plan}
						<tr>
							<td>
								<div class="customer-cell">
									<div class="avatar">
										{plan.customer.name
											?.split(' ')
											.map((w) => w[0])
											.join('')
											.slice(0, 2) ?? '?'}
									</div>
									<div class="d-flex flex-column">
										<span class="bold">{plan.customer.name}</span>
										<small>{plan.name}</small>
									</div>
								</div>
							</td>
							<td>
								<div class="contact-cell">
									<i class="bx bx-phone"></i>
									{plan.customer.phone1}
								</div>
							</td>
							<td>{plan.service.name}</td>
							<td
								><div class="appt-remaining">
									<div class="remaining-bar">
										<div
											class="remaining-fill"
											style="width:{Math.round(
												((plan.total_occurrences - plan.remaining_occurrences) /
													plan.total_occurrences) *
													100
											)}%"
										></div>
									</div>
									<span>
										<strong>{plan.total_occurrences - plan.remaining_occurrences}</strong> / {plan.total_occurrences}
									</span>
								</div></td
							>
							<td>
								{#if plan.status == 0}
									<Badge danger>Pasif</Badge>
								{:else if plan.status == 1}
									<Badge primary>Aktif</Badge>
								{/if}
							</td>

							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn edit"
										onclick={() => goto(`reservation-plans/update/${plan.id}`)}
									>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn delete"
										onclick={() => {
											showModal = true;
											selectedBooking = plan;
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
								Henüz randevu bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<Modal bind:show={showModal} title="Randevu Silme">
	<Confirmation
		text={`Randevuyu silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedBooking = null;
		}}
		on:confirm={handleDeletePlan}
	/>
</Modal>

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
		background: linear-gradient(135deg, #0ea5e9, #42b4e9);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
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

	/* ─── Row Actions ─────────────────────────────────────────── */
	.row-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		justify-content: flex-end;
	}
	.action-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}
	.action-btn i {
		font-size: 16px;
	}
	.action-btn.edit {
		color: #11cdef;
		background: rgba(17, 205, 239, 0.08);
	}
	.action-btn.edit:hover {
		background: rgba(17, 205, 239, 0.2);
	}
	.action-btn.delete {
		color: #fb6340;
		background: rgba(251, 99, 64, 0.08);
	}
	.action-btn.delete:hover {
		background: rgba(251, 99, 64, 0.2);
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
		background: #f5365c;
		border-radius: 3px;
	}
	.appt-remaining span {
		font-size: 12px;
		color: #888;
	}
	.appt-remaining strong {
		color: #f5365c;
	}
</style>
