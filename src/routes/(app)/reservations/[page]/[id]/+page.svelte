<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Booking } from '@controllers/booking';
	import { BookingPlan } from '@controllers/booking_plan';
	import { Department } from '@controllers/department';
	import { Customer } from '@controllers/customer';
	import { Resource } from '@controllers/resource';
	import { Service } from '@controllers/service';
	import { Finance } from '@controllers/finance';
	import { getTimeZone, formatPhoneDisplay } from '@utils/function';
	import { getRecurrenceText } from '@functions/reservation_plans';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import PhoneNumberInput from '@components/custom/PhoneNumberInput.svelte';
	import Modal from '@components/Modal.svelte';
	import CustomerSelector from '@components/custom/reservation/CustomerSelector.svelte';

	// ── Sayfa Ayarları ─────────────────────────────────────────────────────────
	let pageMode = 0;
	let pageTitle;

	// ── CustomerSelector ─────────────────────────────────────────────────────────
	let showModal = false;
	let selectedCustomerData = null;
	let disableCustomerInputs = false;

	let customersList = [];

	function handleCustomerData(e) {
		selectedCustomerData = e.detail;

		customerId = selectedCustomerData.id;
		customerName = selectedCustomerData.name;
		customerPhone = selectedCustomerData.phone1 ?? selectedCustomerData.phone2;
		customerMail = selectedCustomerData.mail;

		disableCustomerInputs = true;
		showModal = false;
	}

	function unselectCustomer() {
		selectedCustomerData = customerId = customerName = customerPhone = customerMail = null;
		disableCustomerInputs = false;
	}

	// ── api'den gelen ─────────────────────────────────────────────────────────
	let services = [];
	let departmentsData = [];
	let resourceData = [];
	let availableTimeSlots = [];
	let paymentTypes = [];

	// ── Filtre veriler ─────────────────────────────────────────────────────────
	let filteredServices = [];
	let filteredResources = [];

	// ── Form ─────────────────────────────────────────────────────────
	let bookingId;
	let customerId;
	let customerName;
	let customerCountryCode;
	let customerPhone;
	let customerMail;

	let bookingDescription;

	let selectedService = { value: null, name: null };
	let selectedDepartment = { value: null, name: null };
	let selectedResource = { value: null, name: null };
	let status = 1;
	let checkinDate = new Date().toISOString().split('T')[0];
	let checkoutDate;
	let saving = false;
	let checkinTime = { id: null, value: null };
	let checkoutTime;

	let paymentTypeID = '6fab21e0-73d2-4927-9d9a-77d2c4082b9a';
	let paymentDescription = 'Peşin Ödeme';

	// Conflict modu için recurrenceText ayarları ─────────────────────────────────────────────────────────
	let recurrenceText;
	let prefferedCheckinTime;

	let recurrenceDays;
	let recurrenceEvery;
	let recurrenceType;

	$: if (recurrenceDays && recurrenceEvery && recurrenceType) {
		recurrenceText = getRecurrenceText(recurrenceType, recurrenceEvery, recurrenceDays);
	}

	// Conflict özel değişkenler

	let planOccurrenceId;
	let bookingPlanId;

	// ── Slot filtre ayarları ─────────────────────────────────────────────────────────
	const date = new Date();
	const today = date.toISOString().split('T')[0];
	checkoutDate = today;
	// Bir gün ekleyerek api isteğine veriliyor
	// date.setDate(date.getDate() + 1);
	// checkoutDate = date.toISOString().split('T')[0];
	// Toplam 5 gün eklenerek panelde takvimden seçim süresi sınırlandırılıyor
	// Bu kısım belki kaldırılabilir
	date.setDate(date.getDate() + 4);
	const maxDate = date.toISOString().split('T')[0];

	$: isReady = customerName && customerPhone && selectedService && checkinTime.value && checkinDate;
	$: initials = customerName
		? customerName
				.split(' ')
				.map((w) => w[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
		: null;

	$: formattedcheckinDate = checkinDate
		? new Date(checkinDate).toLocaleDateString('tr-TR', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			})
		: null;

	// $: checkoutDate = checkoutDate
	// 	? new Date(checkoutDate).toLocaleDateString('tr-TR', {
	// 			day: 'numeric',
	// 			month: 'long',
	// 			year: 'numeric'
	// 		})
	// 	: null;

	$: {
		filteredServices = selectedDepartment?.value
			? services?.filter((s) => s.department_id == selectedDepartment.value)
			: services;
	}
	$: filteredResources = selectedService?.value
		? resourceData?.filter((r) => r.services.some((id) => id == selectedService.value))
		: resourceData;

	$: if (selectedService?.value && selectedResource?.value) {
		getAvaliableTimes(selectedService.value, selectedResource.value, checkinDate, checkoutDate);
	}

	async function getCustomers() {
		let res = await Customer.getAll();

		return res;
	}
	async function getDepartments() {
		let res = await Department.getByCompanyId();

		const department = res.find((x) => x.id == selectedDepartment.value);
		selectedDepartment.name = department ? department.name : '';
		return res;
	}

	async function getResources() {
		let res = await Resource.getAll();

		const unit = res.find((x) => x.id == selectedResource.value);
		selectedResource.name = unit ? unit.data.name : '';

		return res;
	}

	async function getServices() {
		let res = await Service.getByCompanyId();

		const service = res.find((x) => x.id == selectedService.value);
		selectedService.name = service ? service.name : '';

		return res;
	}
	async function getInputDatas() {
		[customersList, departmentsData, resourceData, services] = await Promise.all([
			getCustomers(),
			getDepartments(),
			getResources(),
			getServices()
		]);
	}

	async function getAvaliableTimes(serviceId, resourceId, startedAt, endAt) {
		availableTimeSlots = await Booking.getAvaliableTimesByServiceId(
			serviceId,
			resourceId,
			startedAt,
			endAt
		);

		availableTimeSlots = availableTimeSlots.map((x, i) => {
			x.id = i + 1;

			return x;
		});
	}

	function getReadableTimeString(_date) {
		const date = new Date(_date);

		const readableTime = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
		return readableTime;
	}

	function getISOString(date, time) {
		return `${date}T${time}:00.000Z`;
	}

	function getCompanyId() {
		let strData = localStorage.getItem('user');
		const obj = JSON.parse(strData);
		return obj.company_id;
	}
	// yeni oluştur veya güncelle
	async function handleBookingUpsert() {
		let data = {
			customer_id: customerId,
			service_id: selectedService.value,
			company_id: getCompanyId(), //güncellenecek
			checkin_date: checkinDate,
			checkout_date: checkoutDate,
			checkin_time: checkinTime.value,
			checkout_time: checkoutTime,
			status,
			description: bookingDescription,
			customer_name: customerName,
			customer_country_code: customerCountryCode,
			customer_phone: customerPhone,
			customer_mail: customerMail,
			identifier: '',
			cluster: '',
			resource_id: selectedResource.value,
			department_id: selectedDepartment.value,
			timezone: getTimeZone()
		};

		let res;

		if (pageMode == 2) {
			data.plan_occurrence_id = planOccurrenceId;
			data.booking_plan_id = bookingPlanId;

			res = await Booking.createBookingFromOccurrence(data);
		} else if (pageMode == 1) {
			data.id = bookingId;
			res = await Booking.updateBooking(data);
		} else {
			let body = [data];
			res = await Booking.createBooking(body);

			let service = services.filter((x) => x.id == selectedService.value)[0];

			let payment = {
				booking_id: res.data[0].id,
				payment_type_id: paymentTypeID,
				currency_id: service.currency_id,
				customer_id: customerId,
				amount: service.price,
				status: 2,
				is_refund: 0,
				installment_no: 1,
				total_installments: 1,
				description: paymentDescription,
				paid_at: new Date().toISOString()
			};

			let paymentRes = await Finance.createPayment(payment);
		}
		if (res) {
			return true;
		}
	}

	async function handleSave() {
		saving = true;
		let isOK = await handleBookingUpsert();
		setTimeout(() => {
			saving = false;
			if (isOK) {
				goto('/reservations');
			}
		}, 500);
	}

	onMount(async () => {
		if ($page.params.page == 'create') {
			pageTitle = 'Yeni Rezervasyon';
		} else if ($page.params.page == 'update') {
			pageTitle = 'Rezervasyonu Düzenle';
			pageMode = 1;
		} else if ($page.params.page == 'conflict') {
			pageTitle = 'Rezervasyonu Düzenle';
			pageMode = 2;
		} else {
			goto('/reservations');
		}

		if (pageMode == 1) {
			let res = await Booking.getBookingById($page.params.id);

			if (res) {
				res = res[0];

				bookingId = res.id;
				customerId = res.customerId;
				customerName = res.customer.name ?? res.customer_name;
				customerCountryCode = res.customer.country_code ?? res.customer_country_code;
				customerPhone = res.customer.phone ?? res.customer_phone;
				customerMail = res.customer.mail ?? res.customer_mail;
				status = res.status;
				bookingDescription = res.description;

				// tarihler
				checkinDate = res.checkin_date ? res.checkin_date.split('T')[0] : '';

				checkinTime.value = res.checkin_time;
				checkoutDate = res.checkout_date;
				checkoutTime = res.checkout_time;

				selectedDepartment.value = res.department_id;
				selectedService.value = res.service_id;
				selectedResource.value = res.resource_id;

				// input control
				disableCustomerInputs = res.customer.id;
			}
		} else if (pageMode == 2) {
			let res = await BookingPlan.getConflicts($page.params.id);

			if (res) {
				res = res[0];

				customerId = res.customer.id;
				customerName = res.customer.name;
				customerPhone = res.customer.phone1;
				customerCountryCode = res.customer.phone1_country_code;
				customerMail = res.customer.mail;

				checkinDate = res.scheduled_date ? res.scheduled_date.split('T')[0] : '';
				prefferedCheckinTime = res.scheduled_time.slice(0, 5);

				recurrenceDays = res.plan.recurrence_days;
				recurrenceType = res.plan.recurrence_type;
				recurrenceEvery = res.plan.recurrence_every;

				selectedDepartment.value = res.service.department_id;
				selectedService.value = res.service.id;
				selectedResource.value = res.resource_id;

				planOccurrenceId = res.id;
				bookingPlanId = res.plan.id;
			}
		}
		// kalan api istekleri
		await getInputDatas();
	});
</script>

<!-- ─── Page Header ──────────────────────────────────────────────────── -->
<div class="page-header">
	<div>
		<h5 class="page-title">{pageTitle}</h5>
		<p class="page-sub">Formu doldurun, özet anlık olarak güncellenir.</p>
	</div>
	<button class="back-btn" on:click={() => goto(pageMode == 2 ? '/' : '/reservations')}>
		<i class="bx bx-arrow-back"></i>
		{pageMode == 2 ? 'Anasayfa' : 'Rezervasyonlar'}
	</button>
</div>

<div class="panel-layout">
	<Card>
		<div class="body-wrapper p-4">
			<Row>
				{#if pageMode != 2}
					<Col width="10">
						<div class="section-title">
							<span class="section-num">01</span>
							Müşteri Bilgileri
						</div>
					</Col>
					<Col width="2">
						<div class="d-flex justify-content-end align-items-center gap-3">
							{#if selectedCustomerData}
								<div>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span class="unselect-user" on:click={unselectCustomer}>Seçimi kaldır</span>
								</div>
							{/if}
							<button
								class="t-btn"
								style="background-color: #f46481; padding: 5px 10px; border-radius: 4px;
							color:white; border:none;"
								on:click={() => (showModal = true)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M19 2H5c-.55 0-1 .45-1 1v4H2v2h2v2H2v2h2v2H2v2h2v4c0 .55.45 1 1 1h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 18H6V4h13z"
									></path><path
										d="M12.5 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5m4.5 9c0-1.66-1.34-3-3-3h-3c-1.66 0-3 1.34-3 3v1h9z"
									></path>
								</svg>
							</button>
						</div>
					</Col>
					<Col width="6">
						<label for="f-name">Ad Soyad <span class="req">*</span></label>
						<Input
							id="f-name"
							placeholder="Kişi adı soyadı giriniz"
							bind:value={customerName}
							autoFilled={disableCustomerInputs}
							disabled={disableCustomerInputs}
							icon={'bx-user'}
						/>
					</Col>
					<Col width="6">
						<label for="f-phone">Cep Telefonu <span class="req">*</span></label>
						<PhoneNumberInput
							id="f-phone"
							bind:phoneValue={customerPhone}
							bind:countryCode={customerCountryCode}
							autoFilled={disableCustomerInputs}
							disabled={disableCustomerInputs}
						/>
					</Col>
					<Col width="12">
						<label for="f-email">E-posta <span class="opt">isteğe bağlı</span></label>
						<Input
							id="f-email"
							placeholder="ornek@mail.com"
							type="email"
							bind:value={customerMail}
							autoFilled={disableCustomerInputs}
							disabled={disableCustomerInputs}
							icon={'bx-envelope'}
						/>
					</Col>

					<div class="divider"></div>

					<div class="section-title">
						<span class="section-num">{pageMode == 2 ? '01' : '02'}</span>
						Hizmet Seçimi
					</div>
					<Col width="6">
						<label for="f-department">Departman <span class="req">*</span></label>
						<Select
							id="f-department"
							icon="bx-briefcase"
							on:change={(e) => {
								const select = e.target;
								const option = select.options[select.selectedIndex];

								selectedDepartment.value = option.value;
								selectedDepartment.name = option.text;
							}}
						>
							<option value="" disabled selected>Seçiniz…</option>
							{#if departmentsData}
								{#each departmentsData as department}
									<option
										value={department.id}
										selected={department.id == selectedDepartment.value}
										data-name={department.name}>{department.name}</option
									>
								{/each}
							{/if}
						</Select>
					</Col>

					<Col width="6">
						<label for="f-service">Hizmet Türü <span class="req">*</span></label>
						<Select
							disabled={!selectedDepartment.value}
							id="f-service"
							icon="bx-briefcase"
							on:change={(e) => {
								const select = e.target;
								const option = select.options[select.selectedIndex];

								selectedService.name = option.text;
								selectedService.value = option.value;

								selectedResource.value = '';
								selectedResource.name = '';

								checkinTime = {};
								availableTimeSlots = [];
								availableTimeSlots = availableTimeSlots;
							}}
						>
							<option value="" disabled selected>Seçiniz…</option>

							{#if filteredServices}
								{#each filteredServices as service}
									<!-- if selectedDepartment.value && selectedDepartment.value == -->
									<option
										value={service.id}
										selected={service.id == selectedService.value}
										data-name={service.name}>{service.name}</option
									>
								{/each}
							{/if}
						</Select>
					</Col>

					<Col width="12">
						<label for="f-unit">Kaynak <span class="req">*</span></label>
						<Select
							disabled={!selectedService.value}
							id="f-unit"
							icon="bx-briefcase"
							on:change={(e) => {
								const select = e.target;
								const option = select.options[select.selectedIndex];

								selectedResource.value = option.value;
							}}
						>
							<option id="opt-def" value="" disabled selected>Seçiniz…</option>
							{#if filteredResources}
								{#each filteredResources as resource}
									<option
										id={'opt-' + resource.id}
										value={resource.id}
										selected={resource.id == selectedResource.value}
										data-name={resource.data.name}>{resource.data.name}</option
									>
								{/each}
							{/if}
						</Select>
					</Col>
					<div class="divider"></div>
				{/if}

				<div class="section-title">
					<span class="section-num">{pageMode == 2 ? '01' : '03'}</span>
					Tarih & Saat
				</div>

				<Col width="12">
					<label for="f-date">Tarih <span class="req">*</span></label>
					<div class="input-wrap">
						<Input
							id="f-date"
							min={today}
							max={maxDate}
							type="date"
							bind:value={checkinDate}
							icon="bx-calendar"
						/>
					</div>
				</Col>
				<!-- <Col width="6">
					<label for="f-date">Bitiş Tarihi <span class="req">*</span></label>
					<div class="input-wrap">
						<Input
							id="f-date"
							min={checkinDate || today}
							type="date"
							bind:value={checkoutDate}
							icon="bx-calendar"
						/>
					</div>
				</Col> -->
				<Col>
					<label>Saat <span class="req">*</span></label>
					<div class="time-grid">
						{#if availableTimeSlots}
							{#each availableTimeSlots as t, i}
								<!-- IF'lerde muhtemel bug -->
								<button
									class="time-chip {t.status == 0 && checkinTime.value != t.checkin_time
										? 'disabled'
										: ''} {checkinTime.id === t.id ||
									(checkinTime.value == t.checkin_time && !checkinTime.id)
										? // !checkinTime.id kısmı update tarafında aynı anda iki butona class vermeyi engelliyor
											'selected'
										: ''}"
									on:click={() => {
										if (t.status != 0) {
											checkinTime.id = t.id;
											checkinTime.value = t.checkin_time;
											checkoutTime = t.checkout_time;
										}
									}}
									type="button">{t.checkin_time}</button
								>
							{/each}
						{/if}
					</div>
				</Col>
				<Col>
					<label for="f-status">Durum</label>
					<div class="status-toggle">
						<button
							class="toggle-btn {status == 1 ? 'active' : ''}"
							on:click={() => (status = 1)}
							type="button"
						>
							<i class="bx bx-check-circle"></i> Aktif
						</button>
						<button
							class="toggle-btn danger {status == 0 ? 'active-danger' : ''}"
							on:click={() => (status = 0)}
							type="button"
						>
							<i class="bx bx-x-circle"></i> Pasif
						</button>
					</div>
				</Col>
				<Col width="12">
					<label for="f-notes">Notlar <span class="opt">isteğe bağlı</span></label>
					<Input
						id="f-notes"
						type="textarea"
						placeholder="Rezervasyonla ilgili notlar..."
						bind:value={bookingDescription}
					/>
				</Col>
			</Row>
		</div>
	</Card>

	<div class="summary-panel">
		<Card>
			<div class="body-wrapper p-4">
				<!-- Avatar & Name -->
				<div class="summary-top">
					<div class="avatar {initials ? 'filled' : ''}">
						{#if initials}
							{initials}
						{:else}
							<i class="bx bx-user"></i>
						{/if}
					</div>
					<div class="summary-name">
						<span>{customerName || 'Müşteri adı girilmedi'}</span>
						{#if customerPhone}
							<small>{formatPhoneDisplay(customerCountryCode, customerPhone)}</small>
						{/if}
					</div>
				</div>

				<div class="divider"></div>

				<!-- Details -->
				<ul class="summary-list">
					{#if customerMail}
						<li>
							<span class="sl-key"><i class="bx bx-envelope"></i> E-posta</span>
							<span class="sl-val">{customerMail}</span>
						</li>
					{/if}
					<li>
						<span class="sl-key"><i class="bx bx-store"></i> Departman</span>
						<span class="sl-val {selectedDepartment.value ? '' : 'empty'}"
							>{selectedDepartment.name || '—'}</span
						>
					</li>
					<li>
						<span class="sl-key"><i class="bx bx-briefcase"></i> Hizmet</span>
						<span class="sl-val {selectedService.value ? '' : 'empty'}"
							>{selectedService.name || '—'}</span
						>
					</li>
					<li>
						<span class="sl-key"><i class="bx bx-user"></i> Personel</span>
						<span class="sl-val {selectedResource.value ? '' : 'empty'}"
							>{selectedResource.name || '—'}</span
						>
					</li>
					<li>
						<span class="sl-key"><i class="bx bx-calendar"></i> Tarih</span>
						<div>
							<span class="sl-val {formattedcheckinDate ? '' : 'empty'}"
								>{formattedcheckinDate || '—'}</span
							>
							<!-- <span class="sl-val {checkoutDate ? '' : 'empty'}"
								>{`- ${checkoutDate ? checkoutDate : '—'}`}</span
							> -->
						</div>
					</li>
					<li>
						<span class="sl-key"><i class="bx bx-time"></i> Saat</span>
						<div>
							<span class="sl-val {checkinTime.value ? '' : 'empty'}"
								>{checkinTime.value?.slice(0, 5) || '—'}</span
							>
							<span class="sl-val {checkoutTime ? '' : 'empty'}"
								>{`- ${checkoutTime ? checkoutTime?.slice(0, 5) : '-'}`}</span
							>
						</div>
					</li>
				</ul>

				<!-- Recurrence -->
				{#if recurrenceText}
					<div class="summary-recurrence my-4">
						<div class="label-wrapper">
							<div class="label">Plan Periyodu</div>
							<i class="bx bx-sync"></i>
						</div>
						<span class="value">{recurrenceText}</span>
						<span class="value">Tercih edilen randevu saati: {prefferedCheckinTime}</span>
					</div>
				{/if}

				{#if bookingDescription}
					<div class="summary-note">
						<i class="bx bx-note"></i>
						<span>{bookingDescription}</span>
					</div>
				{/if}

				<div class="divider"></div>

				<!-- Status Badge -->
				<div class="summary-status">
					<span class="status-dot {status == 1 ? 'green' : 'red'}"></span>
					{status == 1 ? 'Aktif Rezervasyon' : 'Pasif Rezervasyon'}
				</div>

				<!-- Save -->
				<button
					class="save-btn my-3 {isReady ? '' : 'disabled'}"
					on:click={isReady ? handleSave : null}
					disabled={!isReady || saving}
					type="button"
				>
					{#if saving}
						<i class="bx bx-loader-alt bx-spin"></i> Kaydediliyor…
					{:else if !isReady}
						<i class="bx bx-lock-alt"></i> Alanları doldurun
					{:else}
						<i class="bx bx-save"></i> Rezervasyonu Kaydet
					{/if}
				</button>

				{#if !isReady}
					<p class="required-hint">
						<i class="bx bx-info-circle"></i>
						Ad, telefon, hizmet, tarih ve saat zorunludur.
					</p>
				{/if}
			</div>
		</Card>
	</div>
</div>

<Modal bind:show={showModal} title="Müşteri Arama">
	<CustomerSelector customers={customersList} on:confirm={handleCustomerData} />
</Modal>

<style>
	/* ─── Two-Panel Layout ──────────────────────────────────────────── */
	.panel-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 20px;
		align-items: start;
	}

	/* ─── Input ──────────────────────────────────────────── */

	.req {
		color: #f5365c;
		font-size: 12px;
		line-height: 1;
	}
	.opt {
		font-size: 10px;
		font-weight: 400;
		color: #b0b8c4;
		text-transform: none;
		letter-spacing: 0;
		background: #f0f2f5;
		border-radius: 4px;
		padding: 1px 6px;
	}

	.unselect-user {
		color: #f5365c;
		text-decoration: underline;
		cursor: pointer;
		user-select: none;
	}

	/* ─── Time Grid ─────────────────────────────────────────────────── */
	.time-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}
	.time-chip {
		padding: 6px 13px;
		border: 1.5px solid #ebedf0;
		border-radius: 7px;
		font-size: 12.5px;
		font-weight: 500;
		color: #445471;
		background: #f7f8fa;
		cursor: pointer;
		transition: all 150ms ease;
		font-family: inherit;
	}
	.time-chip:hover {
		border-color: #f5365c;
		color: #f5365c;
		background: rgba(245, 54, 92, 0.04);
	}
	.time-chip.selected {
		background: linear-gradient(135deg, #f5365c, #f4226d);
		border-color: #f5365c;
		color: white;
		box-shadow: 0 2px 8px rgba(245, 54, 92, 0.3);
	}

	.time-chip.disabled {
		background: linear-gradient(135deg, #616161, #616161);
		border-color: #616161;
		color: #c2c2c2;
		/* box-shadow: 0 2px 8px rgba(245, 54, 92, 0.3); */
	}

	/* ─── Summary Panel ─────────────────────────────────────────────── */
	.summary-panel {
		position: sticky;
		top: 20px;
	}
	/* Avatar & Name */
	.summary-top {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.avatar {
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 2px dashed #ebedf0;
		background: #f7f8fa;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 800;
		color: #b0b8c4;
		flex-shrink: 0;
		transition: all 250ms ease;
	}
	.avatar.filled {
		background: linear-gradient(135deg, #f5365c, #f4226d);
		border: 2px solid transparent;
		color: white;
		box-shadow: 0 4px 12px rgba(245, 54, 92, 0.35);
		font-size: 15px;
	}
	.avatar i {
		font-size: 20px;
	}
	.summary-name span {
		display: block;
		font-size: 14px;
		font-weight: 700;
		color: #252c38;
		line-height: 1.2;
	}
	.summary-name small {
		font-size: 12px;
		color: #9aa3b0;
	}

	/* List */
	.summary-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.summary-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 9px 0;
		border-bottom: 1px solid #f7f8fa;
		gap: 8px;
	}
	.summary-list li:last-child {
		border-bottom: none;
	}
	.sl-key {
		font-size: 11px;
		font-weight: 600;
		color: #9aa3b0;
		display: flex;
		align-items: center;
		gap: 5px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.sl-key i {
		font-size: 13px;
	}
	.sl-val {
		font-size: 13px;
		font-weight: 600;
		color: #252c38;
		text-align: right;
	}
	.sl-val.empty {
		color: #c4cad4;
		font-weight: 400;
	}

	/* recurrence */
	.summary-recurrence {
		background-color: #f8f9fa; /* Çok hafif, temiz bir gri */
		border: 1px solid #e9ecef;
		border-radius: 10px;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		position: relative;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
	}

	.summary-recurrence::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background-color: #f5365c;
		border-radius: 10px 0 0 10px;
	}

	.summary-recurrence .label-wrapper {
		display: flex;
		justify-content: start;
		align-items: center;
		gap: 8px;
	}

	.summary-recurrence .label-wrapper .label {
		font-size: 11.5px;
		color: #8898aa; /* Yumuşak bir başlık rengi */
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.summary-recurrence .label-wrapper i {
		color: #f5365c;
		font-size: 16px;
	}
	.summary-recurrence .value {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12.5px;
		font-weight: 700;
		color: #2c3e50;
		line-height: 1.5;
	}

	/* Note */
	.summary-note {
		display: flex;
		gap: 8px;
		background: #fffbf0;
		border: 1px solid #fde8b0;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 12.5px;
		color: #7a6530;
		line-height: 1.5;
		white-space: pre-wrap;
	}
	.summary-note i {
		font-size: 15px;
		flex-shrink: 0;
		margin-top: 1px;
	}

	/* Divider */
	.summary-divider {
		height: 1px;
		background: #f0f2f5;
	}

	/* Status */
	.summary-status {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 12.5px;
		font-weight: 600;
		color: #445471;
	}
	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.status-dot.green {
		background: #2dce89;
		box-shadow: 0 0 0 3px rgba(45, 206, 137, 0.2);
	}
	.status-dot.red {
		background: #fb6340;
		box-shadow: 0 0 0 3px rgba(251, 99, 64, 0.2);
	}

	/* Save Button */
	.save-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 11px;
		background: linear-gradient(135deg, #2dce89, #26af74);
		border: none;
		border-radius: 9px;
		font-size: 13.5px;
		font-weight: 700;
		color: white;
		cursor: pointer;
		transition: all 150ms ease;
		box-shadow: 0 3px 10px rgba(45, 206, 137, 0.35);
		font-family: inherit;
	}
	.save-btn:hover:not(:disabled):not(.disabled) {
		box-shadow: 0 5px 16px rgba(45, 206, 137, 0.45);
		transform: translateY(-1px);
	}
	.save-btn.disabled,
	.save-btn:disabled {
		background: #ebedf0;
		color: #b0b8c4;
		box-shadow: none;
		cursor: not-allowed;
		transform: none;
	}

	/* Hint */
	.required-hint {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11.5px;
		color: #b0b8c4;
		margin: 0;
		text-align: center;
		justify-content: center;
	}
	.required-hint i {
		font-size: 13px;
	}

	@media (max-width: 900px) {
		.panel-layout {
			grid-template-columns: 1fr;
		}
		.summary-panel {
			position: static;
		}
	}
	@media (max-width: 640px) {
		.divider {
			margin: 0 16px;
		}
	}
</style>
