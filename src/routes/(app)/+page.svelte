<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CompanyStats } from '@controllers/company_stats';
	import { Booking } from '@controllers/booking';
	import { BookingPlan } from '@controllers/booking_plan';
	import { formatDate } from '@utils/function';
	import { getReservationStatus } from '@functions/booking';
	import ConflictOccurrences from '@components/custom/dashboard/ConflictOccurrences.svelte';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Modal from '@components/Modal.svelte';
	import ReservationDetailModal from '@components/custom/reservation/ReservationDetails.svelte';
	import Badge from '@components/Badge.svelte';

	let stats = {
		totalDepartments: 0,
		totalServices: 0,
		totalUsers: 0,
		totalBookings: 0,
		totalCancelledBookings: 0,
		totalCompletedBookings: 0,
		totalNoshowBookings: 0,
		activeBookings: 0
	};

	// Details
	let modalOpen = $state(false);
	let selectedBooking = $state(null);

	function openDetailModal(reservation) {
		selectedBooking = reservation;
		modalOpen = true;
	}

	//
	let conflicts = $state([]);

	// --- Static Data ---
	const today = new Date();

	// KPI cards
	let kpiCards = $state();

	// Weekly chart
	let weekDays = $state(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']);
	// let weekData = [8, 12, 6, 15, 10, 18, 12];
	let weekData = $state([]);
	let maxVal = $state();

	let upcomingReservations = $state([]);
	let todaysReservations = $state([]);
	let showModalDailyRes = $state(false);

	function fmt(date) {
		return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
	}

	// 5-day calendar data (today + next 4 days)
	const calendarDays = Array.from({ length: 5 }, (_, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() + i);
		return {
			date: d,
			label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
			day: d.getDate(),
			isToday: i === 0,
			events: [3, 5, 2, 7, 1][i]
		};
	});

	// Popular services
	const popularServices = [
		{ name: 'Masaj', count: 48, pct: 80 },
		{ name: 'Saç Kesimi', count: 36, pct: 60 },
		{ name: 'Cilt Bakımı', count: 24, pct: 40 },
		{ name: 'Tırnak Bakımı', count: 18, pct: 30 },
		{ name: 'Sakal Tıraşı', count: 12, pct: 20 }
	];

	// Activity feed
	const activities = [
		{
			icon: 'bx-plus',
			color: '#2DCE89',
			text: 'Ahmet Kaya — Masaj rezervasyonu oluşturdu',
			time: '5 dk önce'
		},
		{
			icon: 'bx-edit',
			color: '#11CDEF',
			text: 'Elif Şahin — Saç Kesimi güncellendi',
			time: '23 dk önce'
		},
		{
			icon: 'bx-x',
			color: '#FB6340',
			text: 'Murat Demir — Cilt Bakımı iptal edildi',
			time: '1 sa önce'
		},
		{
			icon: 'bx-plus',
			color: '#2DCE89',
			text: 'Selin Arslan — Masaj rezervasyonu oluşturdu',
			time: '2 sa önce'
		},
		{
			icon: 'bx-check',
			color: '#F5365C',
			text: 'Can Yıldız — Tırnak Bakımı tamamlandı',
			time: '3 sa önce'
		}
	];

	// Quick actions
	const quickActions = [
		{
			label: 'Yeni Randevu',
			icon: 'bx-calendar-plus',
			href: '/reservations/create/new',
			primary: true
		},
		{ label: 'Hizmet Ekle', icon: 'bx-plus-circle', href: '/services', primary: false },
		{ label: 'Departman Ekle', icon: 'bx-store', href: '/departments', primary: false },
		{ label: 'Tüm Randevular', icon: 'bx-list-ul', href: '/reservations', primary: false }
	];
	// Load Data
	async function getStats() {
		let totalStatsData = await CompanyStats.getTotalStats();
		if (totalStatsData) {
			stats.totalBookings = totalStatsData.total_bookings || 0;
			stats.totalDepartments = totalStatsData.total_departments || 0;
			stats.totalUsers = totalStatsData.total_users || 0;
			stats.totalServices = totalStatsData.total_services || 0;
			stats.activeBookings = totalStatsData.active_bookings || 0;
			stats.totalNoshowBookings = totalStatsData.total_noshow_bookings || 0;
			stats.totalCancelledBookings = totalStatsData.total_cancelled_bookings || 0;
			stats.totalCompletedBookings = totalStatsData.total_completed_bookings || 0;

			kpiCards = [
				{
					title: 'Toplam Randevular',
					value: stats.totalBookings,
					sub: 'Tüm zamanlar',
					icon: 'bx-calendar-check',
					color: '#F5365C',
					light: 'rgba(245,54,92,0.1)'
				},
				{
					title: 'Tamamlanan Randevu',
					value: stats.totalCompletedBookings,
					sub: 'Tüm zamanlar',
					icon: ' bx-check-circle',
					color: '#2DCE89',
					light: 'rgba(45,206,137,0.1)'
				},
				{
					title: 'Aktif Randevu',
					value: stats.activeBookings,
					sub: 'Tüm zamanlar',
					icon: 'bx-briefcase',
					color: '#11CDEF',
					light: 'rgba(17,205,239,0.1)'
				},
				{
					title: 'İptal / Pasif',
					value: stats.totalCancelledBookings,
					sub: 'Tüm zamanlar',
					icon: 'bx-x-circle',
					color: '#FB6340',
					light: 'rgba(251,99,64,0.1)'
				}
			];
		}

		let weeklyStatsData = await CompanyStats.getWeeklyStats();

		if (weeklyStatsData) {
			// Günlerin Sıralanması
			// Bugün index (0 = Pzt, 6 = Paz)
			let todayIndex = new Date().getDay() - 1;
			if (todayIndex < 0) todayIndex = 6;

			const reorderedWeekDays = [
				...weekDays.slice(0, todayIndex),
				...weekDays.slice(todayIndex + 1),
				weekDays[todayIndex]
			];

			weekDays = reorderedWeekDays;
			// /Günlerin Sıralanması

			// Verilerin getirilmesi

			for (let i = 0; i < weeklyStatsData.length; i++) {
				weekData.unshift(weeklyStatsData[i].daily_bookings);
			}
			if (weekData.length < 7) {
				let len = weekData.length;
				for (let i = 0; i < 7 - len; i++) {
					weekData.unshift(0);
				}
			}

			weekData = weekData;
			maxVal = Math.max(...weekData);
		}

		let today = new Date();

		let dailyBookings = await Booking.getAllByCompanyId({
			page_size: 5,
			start: today.toISOString().split('T')[0],
			end: today.toISOString().split('T')[0],
			sort: 'checkin_time',
			order: 'asc',
			period: 'upcoming'
		});

		if (dailyBookings) {
			upcomingReservations = dailyBookings?.items ?? [];
		}
	}
	async function getConflicts() {
		let res = await BookingPlan.getConflicts();
		if (res) {
			conflicts = res;
		}
	}

	async function getTodaysReservations() {
		let today = new Date();

		let res = await Booking.getAllByCompanyId({
			start: today.toISOString().split('T')[0],
			end: today.toISOString().split('T')[0],
			sort: 'checkin_time',
			order: 'asc',
			status: [1, 2]
		});

		todaysReservations = res?.items ?? [];
	}

	async function loadData() {
		getStats();
		getConflicts();
	}

	onMount(init);

	async function init() {
		loadData();
	}
</script>

<svelte:head>
	<title>Anasayfa | Xess Booking</title>
	<meta name="description" content="Şirketinizin genel istatiklerinin takibi." />
</svelte:head>

<div class="dashboard">
	<!-- Header -->
	<div class="dash-header">
		<div>
			<h5 class="page-title mb-1">Anasayfa</h5>
			<p class="dash-date">
				<i class="bx bx-calendar"></i>
				{today.toLocaleDateString('tr-TR', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		</div>
		<div class="quick-actions">
			{#each quickActions as action}
				<button
					class="qa-btn {action.primary ? 'qa-primary' : 'qa-secondary'}"
					onclick={() => goto(action.href)}
				>
					<i class="bx {action.icon}"></i>
					<span>{action.label}</span>
				</button>
			{/each}
		</div>
	</div>
	<Row>
		<!-- KPI Cards -->
		{#if kpiCards}
			{#each kpiCards as card}
				<Col width="3">
					<div class="kpi-card" style="--accent: {card.color}; --light: {card.light}">
						<div class="kpi-icon" style="background: {card.light}">
							<i class="bx {card.icon}" style="color: {card.color}"></i>
						</div>
						<div class="kpi-body">
							<div class="kpi-value">{card.value}</div>
							<div class="kpi-title">{card.title}</div>
							<div class="kpi-sub">{card.sub}</div>
						</div>
					</div>
				</Col>
			{/each}
		{/if}

		<Col width="6">
			<ConflictOccurrences {conflicts} />
		</Col>

		<Col width="6">
			<div class="t-card today-card">
				<div class="card-header">
					<div>
						<span class="card-title">Bugünün Randevuları</span>
						<span class="card-sub">{upcomingReservations.length} kayıt</span>
					</div>

					<a
						class="see-all"
						href="#"
						onclick={() => {
							getTodaysReservations();
							showModalDailyRes = true;
						}}
						style="cursor:pointer"
					>
						Tümü <i class="bx bx-right-arrow-alt"></i>
					</a>
				</div>
				<div class="today-list">
					{#if upcomingReservations.length > 0}
						{#each upcomingReservations as r}
							{@const customerName = r.customer?.name || r.customer_name}
							<div class="today-row">
								<div class="tr-time">{r.checkin_time.slice(0, 5)}</div>
								<div class="tr-avatar">
									{customerName
										.split(' ')
										.map((w) => w[0])
										.join('')
										.slice(0, 2)}
								</div>
								<div class="tr-info">
									<div class="tr-name">{customerName}</div>
									<div class="tr-service">{r.service_name}</div>
								</div>

								<span class="action-btn view" onclick={() => openDetailModal(r)}>
									<i class="bx bx-show"></i>
								</span>
							</div>
						{/each}
					{:else}
						<div class="empty-today">
							<div class="empty-today-icon">
								<i class="bx bx-calendar-x"></i>
							</div>
							<div class="empty-today-title">Bugün randevu yok</div>
							<div class="empty-today-sub">Bugüne ait henüz bir randevu kaydı oluşturulmamış.</div>
							<button class="empty-today-btn" onclick={() => goto('/reservations/create/new')}>
								<i class="bx bx-plus"></i> Randevu Oluştur
							</button>
						</div>
					{/if}
				</div>
			</div>
		</Col>

		<ReservationDetailModal
			bind:show={modalOpen}
			reservation={selectedBooking}
			on:edit={(e) => goto(`/reservations/update/${e.detail.id}`)}
		/>

		<Col width="12"
			><div class="t-card chart-card">
				<div class="card-header">
					<div>
						<span class="card-title">Haftalık Rezervasyon</span>
						<span class="card-sub">Son 7 gün</span>
					</div>
					<span class="total-badge">Toplam: {weekData.reduce((a, b) => a + b, 0)}</span>
				</div>
				<div class="bar-chart">
					{#if weekData.length > 0}
						{#each weekDays as day, i}
							<div class="bar-col">
								<div class="bar-label-top">{weekData[i]}</div>
								<div class="bar-wrapper">
									<div
										class="bar {i === new Date().getDay() - 1 ? 'bar-today' : ''}"
										style="height: {(weekData[i] / maxVal) * 100}%"
									></div>
								</div>
								<div class="bar-label">{day}</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</Col>

		{#if false}
			<!-- 5-Day Calendar Placeholder -->
			<Col width="4">
				<div class="t-card calendar-card">
					<div class="card-header">
						<div>
							<span class="card-title">5 Günlük Takvim</span>
							<span class="card-sub">
								{fmt(calendarDays[0].date)} – {fmt(calendarDays[4].date)}
							</span>
						</div>
						<!-- svelte-ignore a11y_missing_attribute -->
						<a class="see-all" onclick={() => goto('/calendar')} style="cursor:pointer">
							Takvim <i class="bx bx-right-arrow-alt"></i>
						</a>
					</div>
					<!-- ─────────────────────────────────────────────────────────
				 FullCalendar widget buraya entegre edilecek.
				 id="fullcalendar-widget-placeholder" 
			     ───────────────────────────────────────────────────────── -->
					<div id="fullcalendar-widget-placeholder">
						<div class="fc-days-row">
							{#each calendarDays as d}
								<div class="fc-day {d.isToday ? 'fc-day-today' : ''}">
									<div class="fc-day-name">{d.label}</div>
									<div class="fc-day-num">{d.day}</div>
									<div class="fc-day-events">
										{#each Array(Math.min(d.events, 3)) as _}
											<div class="fc-event-dot"></div>
										{/each}
										{#if d.events > 3}
											<div class="fc-event-more">+{d.events - 3}</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
						<div class="fc-hint">
							<i class="bx bx-calendar-event"></i>
							FullCalendar bu alana entegre edilecek
						</div>
					</div>
				</div>
			</Col>

			<!-- Popular Services -->
			<Col width="4">
				<div class="t-card services-card">
					<div class="card-header">
						<div>
							<span class="card-title">Popüler Hizmetler</span>
							<span class="card-sub">Bu ay</span>
						</div>
					</div>
					<div class="services-list">
						{#each popularServices as s, i}
							<div class="service-row">
								<div class="service-rank">#{i + 1}</div>
								<div class="service-info">
									<div class="service-name-row">
										<span class="service-name">{s.name}</span>
										<span class="service-count">{s.count} rez.</span>
									</div>
									<div class="progress-bar-bg">
										<div class="progress-bar-fill" style="width: {s.pct}%"></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</Col>

			<!-- Activity Feed -->
			<Col width="4">
				<div class="t-card activity-card">
					<div class="card-header">
						<div>
							<span class="card-title">Son Aktiviteler</span>
							<span class="card-sub">Gerçek zamanlı</span>
						</div>
					</div>
					<div class="activity-list">
						{#each activities as a}
							<div class="activity-row">
								<div class="activity-icon" style="background: {a.color}22; color: {a.color}">
									<i class="bx {a.icon}"></i>
								</div>
								<div class="activity-body">
									<div class="activity-text">{a.text}</div>
									<div class="activity-time">
										<i class="bx bx-time-five"></i>
										{a.time}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</Col>
		{/if}
	</Row>
</div>

<Modal bind:show={showModalDailyRes} title="Bugünün Randevuları">
	<div class="daily-modal">
		<!-- Başlık / Özet -->
		<div class="daily-modal-header">
			<div class="daily-date-badge">
				<i class="bx bx-calendar-check"></i>
				{today.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
			</div>
			<div class="daily-count-badge">
				{todaysReservations.length} randevu
			</div>
		</div>

		<!-- Liste -->
		{#if todaysReservations.length > 0}
			<div class="daily-list">
				{#each todaysReservations as r}
					{@const customerName = r.customer?.name || r.customer_name || '—'}
					{@const bookingStatus = getReservationStatus(r)}
					{@const initials = customerName
						.split(' ')
						.map((w) => w[0])
						.join('')
						.slice(0, 2)
						.toUpperCase()}

					<div class="daily-item">
						<!-- Sol: Saat çizgisi -->
						<div class="daily-time-col">
							<span class="daily-time">{r.checkin_time?.slice(0, 5) ?? '--:--'}</span>
							<div class="daily-time-line"></div>
						</div>

						<!-- Kart -->
						<div class="daily-item-card">
							<div class="daily-item-left">
								<div class="daily-avatar">{initials}</div>
								<div class="daily-item-info">
									<div class="daily-item-name">{customerName}</div>
									<div class="daily-item-meta">
										<i class="bx bx-briefcase"></i>
										{r.service_name ?? '—'}
										{#if r.resource?.name}
											<span class="daily-dot">·</span>
											<i class="bx bx-user"></i>
											{r.resource.name}
										{/if}
									</div>
									<div class="daily-item-time-range">
										<i class="bx bx-time"></i>
										{r.checkin_time?.slice(0, 5)} – {r.checkout_time?.slice(0, 5)}
									</div>
								</div>
							</div>
							<div class="daily-item-right">
								<Badge theme={bookingStatus.theme}>{bookingStatus.title}</Badge>
								<button
									class="daily-detail-btn"
									onclick={() => {
										showModalDailyRes = false;
										openDetailModal(r);
									}}
								>
									<i class="bx bx-show"></i>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="daily-empty">
				<div class="daily-empty-icon">
					<i class="bx bx-calendar-x"></i>
				</div>
				<div class="daily-empty-title">Bugün randevu yok</div>
				<div class="daily-empty-sub">Bugüne ait henüz bir randevu kaydı oluşturulmamış.</div>
				<button
					class="empty-today-btn"
					onclick={() => {
						showModalDailyRes = false;
						goto('/reservations/create/new');
					}}
				>
					<i class="bx bx-plus"></i> Randevu Oluştur
				</button>
			</div>
		{/if}

		<!-- Footer -->
		<div class="daily-modal-footer">
			<button
				class="daily-footer-link"
				onclick={() => {
					showModalDailyRes = false;
					goto('/reservations');
				}}
			>
				<i class="bx bx-list-ul"></i> Tüm Randevulara Git
			</button>
		</div>
	</div>
</Modal>

<style>
	/* Layout */
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding-bottom: 24px;
	}

	/* Header */
	.dash-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}
	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: #252c38;
		margin: 0;
	}
	.dash-date {
		font-size: 13px;
		color: #7a8699;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	/* Quick Actions */
	.quick-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
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
	.qa-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	.qa-primary {
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
	}
	.qa-secondary {
		background: white;
		color: #445471;
		border: 1px solid #e0e4ec;
	}
	.qa-btn i {
		font-size: 16px;
	}

	.kpi-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		transition:
			box-shadow 150ms ease,
			transform 150ms ease;
	}
	.kpi-card:hover {
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
		transform: translateY(-2px);
	}
	.kpi-icon {
		width: 52px;
		height: 52px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.kpi-icon i {
		font-size: 24px;
	}
	.kpi-value {
		font-size: 28px;
		font-weight: 700;
		color: #252c38;
		line-height: 1;
	}
	.kpi-title {
		font-size: 12px;
		color: #7a8699;
		margin-top: 3px;
	}
	.kpi-sub {
		font-size: 11px;
		color: var(--accent);
		margin-top: 2px;
		font-weight: 500;
	}

	/* Shared card */
	.t-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
		padding: 20px;
	}
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 18px;
	}
	.card-title {
		display: block;
		font-size: 15px;
		font-weight: 600;
		color: #252c38;
	}
	.card-sub {
		display: block;
		font-size: 12px;
		color: #9aa3b0;
		margin-top: 2px;
	}
	.total-badge {
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		font-size: 12px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 20px;
	}
	.see-all {
		font-size: 12px;
		color: #f5365c;
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 3px;
		font-weight: 500;
	}
	.see-all:hover {
		text-decoration: underline;
	}

	/* Bar Chart */
	.chart-card {
		display: flex;
		flex-direction: column;
	}
	.bar-chart {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 8px;
		height: 160px;
		padding-top: 24px;
	}
	.bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
	}
	.bar-wrapper {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
	}
	.bar {
		width: 100%;
		background: linear-gradient(180deg, rgba(245, 54, 92, 0.7) 0%, rgba(245, 54, 92, 0.2) 100%);
		border-radius: 6px 6px 0 0;
	}
	.bar-today {
		background: linear-gradient(180deg, #f5365c 0%, #f4226d 100%);
		box-shadow: 0 4px 12px rgba(245, 54, 92, 0.4);
	}
	.bar-label {
		font-size: 11px;
		color: #9aa3b0;
		margin-top: 6px;
	}
	.bar-label-top {
		font-size: 11px;
		font-weight: 600;
		color: #445471;
		margin-bottom: 4px;
		min-height: 16px;
	}

	/* Today's Reservations */
	.today-card {
		height: 328px;
	}
	.today-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.today-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.tr-time {
		font-size: 12px;
		font-weight: 600;
		color: #7a8699;
		min-width: 38px;
	}
	.tr-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.tr-info {
		flex: 1;
	}
	.tr-name {
		font-size: 13px;
		font-weight: 600;
		color: #252c38;
	}
	.tr-service {
		font-size: 11px;
		color: #9aa3b0;
	}
	.tr-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 20px;
	}
	.badge-active {
		background: rgba(45, 206, 137, 0.12);
		color: #2dce89;
	}
	.badge-passive {
		background: rgba(251, 99, 64, 0.12);
		color: #fb6340;
	}

	/* Empty State - Bugün */
	.empty-today {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 24px 16px;
		text-align: center;
		height: 100%;
	}
	.empty-today-icon {
		width: 56px;
		height: 56px;
		border-radius: 16px;
		background: linear-gradient(135deg, rgba(245, 54, 92, 0.08), rgba(245, 54, 92, 0.15));
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;
	}
	.empty-today-icon i {
		font-size: 26px;
		color: #f5365c;
		opacity: 0.7;
	}
	.empty-today-title {
		font-size: 14px;
		font-weight: 700;
		color: #2d3a52;
	}
	.empty-today-sub {
		font-size: 12px;
		color: #9aa3b0;
		max-width: 200px;
		line-height: 1.5;
	}
	.empty-today-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-top: 8px;
		padding: 7px 16px;
		border-radius: 8px;
		border: none;
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition:
			opacity 150ms ease,
			transform 150ms ease;
	}
	.empty-today-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}
	.empty-today-btn i {
		font-size: 14px;
	}

	/* 5-Day Calendar Placeholder */
	.calendar-card {
		display: flex;
		flex-direction: column;
	}
	#fullcalendar-widget-placeholder {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
	}
	.fc-days-row {
		display: flex;
		gap: 8px;
	}
	.fc-day {
		flex: 1;
		background: #f7f8fa;
		border-radius: 10px;
		padding: 10px 6px;
		text-align: center;
		border: 2px solid transparent;
		transition: border-color 150ms;
	}
	.fc-day-today {
		border-color: #f5365c;
		background: rgba(245, 54, 92, 0.05);
	}
	.fc-day-name {
		font-size: 11px;
		color: #9aa3b0;
		text-transform: uppercase;
		font-weight: 600;
	}
	.fc-day-num {
		font-size: 20px;
		font-weight: 700;
		color: #252c38;
		margin: 4px 0;
	}
	.fc-day-today .fc-day-num {
		color: #f5365c;
	}
	.fc-day-events {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 3px;
		min-height: 16px;
	}
	.fc-event-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #f5365c;
	}
	.fc-event-more {
		font-size: 10px;
		color: #f5365c;
		font-weight: 700;
	}
	.fc-hint {
		background: #f7f8fa;
		border: 1.5px dashed #d0d5dd;
		border-radius: 8px;
		padding: 20px;
		text-align: center;
		font-size: 12px;
		color: #9aa3b0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		flex: 1;
		min-height: 90px;
	}
	.fc-hint i {
		font-size: 18px;
	}

	/* Popular Services */
	.services-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.service-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.service-rank {
		width: 20px;
		font-size: 12px;
		font-weight: 700;
		color: #c3c9d4;
		text-align: center;
		flex-shrink: 0;
	}
	.service-info {
		flex: 1;
	}
	.service-name-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 5px;
	}
	.service-name {
		font-size: 13px;
		font-weight: 600;
		color: #252c38;
	}
	.service-count {
		font-size: 11px;
		color: #9aa3b0;
	}
	.progress-bar-bg {
		height: 5px;
		background: #f0f2f5;
		border-radius: 10px;
		overflow: hidden;
	}
	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #f5365c, #f4226d);
		border-radius: 10px;
	}

	/* Activity Feed */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.activity-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}
	.activity-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.activity-icon i {
		font-size: 16px;
	}
	.activity-text {
		font-size: 12px;
		color: #445471;
		line-height: 1.4;
	}
	.activity-time {
		font-size: 11px;
		color: #9aa3b0;
		margin-top: 3px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	/* ── Daily Modal ───────────────────────────────────────── */
	.daily-modal {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 480px;
	}
	.daily-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 12px;
		border-bottom: 1.5px solid #f0f2f5;
	}
	.daily-date-badge {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 13.5px;
		font-weight: 600;
		color: #252c38;
	}
	.daily-date-badge i {
		font-size: 18px;
		color: #f5365c;
	}
	.daily-count-badge {
		background: rgba(245, 54, 92, 0.1);
		color: #f5365c;
		font-size: 12px;
		font-weight: 600;
		padding: 4px 12px;
		border-radius: 20px;
	}

	/* Zaman çizgisi liste */
	.daily-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-height: 460px;
		overflow-y: auto;
		padding-right: 4px;
	}
	.daily-item {
		display: flex;
		align-items: stretch;
		gap: 12px;
	}
	.daily-time-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 44px;
		flex-shrink: 0;
		padding-top: 14px;
	}
	.daily-time {
		font-size: 11.5px;
		font-weight: 700;
		color: #7a8699;
		white-space: nowrap;
	}
	.daily-time-line {
		flex: 1;
		width: 2px;
		background: #f0f2f5;
		margin-top: 6px;
		min-height: 16px;
	}
	.daily-item:last-child .daily-time-line {
		display: none;
	}
	.daily-item-card {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #fafbfc;
		border: 1.5px solid #ebedf0;
		border-radius: 10px;
		padding: 10px 14px;
		margin-bottom: 8px;
		gap: 10px;
		transition:
			border-color 150ms,
			box-shadow 150ms;
	}
	.daily-item-card:hover {
		border-color: rgba(245, 54, 92, 0.3);
		box-shadow: 0 2px 10px rgba(245, 54, 92, 0.07);
	}
	.daily-item-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.daily-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.daily-item-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.daily-item-name {
		font-size: 13.5px;
		font-weight: 600;
		color: #252c38;
	}
	.daily-item-meta {
		font-size: 11.5px;
		color: #7a8699;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.daily-item-meta i {
		font-size: 12px;
	}
	.daily-dot {
		color: #c4cad4;
	}
	.daily-item-time-range {
		font-size: 11px;
		color: #9aa3b0;
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 1px;
	}
	.daily-item-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}
	.daily-detail-btn {
		width: 30px;
		height: 30px;
		border-radius: 7px;
		border: 1.5px solid #ebedf0;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #7a8699;
		transition: all 150ms;
	}
	.daily-detail-btn:hover {
		border-color: #f5365c;
		color: #f5365c;
		background: rgba(245, 54, 92, 0.05);
	}
	.daily-detail-btn i {
		font-size: 15px;
	}
	.badge-cancel {
		background: rgba(155, 106, 245, 0.12);
		color: #7c4de8;
	}

	/* Boş durum */
	.daily-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 40px 16px;
		text-align: center;
	}
	.daily-empty-icon {
		width: 60px;
		height: 60px;
		border-radius: 16px;
		background: rgba(245, 54, 92, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;
	}
	.daily-empty-icon i {
		font-size: 28px;
		color: #f5365c;
		opacity: 0.7;
	}
	.daily-empty-title {
		font-size: 15px;
		font-weight: 700;
		color: #2d3a52;
	}
	.daily-empty-sub {
		font-size: 12px;
		color: #9aa3b0;
		max-width: 220px;
		line-height: 1.5;
	}

	/* Footer */
	.daily-modal-footer {
		padding-top: 12px;
		border-top: 1.5px solid #f0f2f5;
		display: flex;
		justify-content: center;
	}
	.daily-footer-link {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: #f5365c;
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px 12px;
		border-radius: 7px;
		transition: background 150ms;
	}
	.daily-footer-link:hover {
		background: rgba(245, 54, 92, 0.07);
	}
	.daily-footer-link i {
		font-size: 16px;
	}
</style>
