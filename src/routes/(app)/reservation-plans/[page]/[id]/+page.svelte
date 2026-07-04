<script>
	import { run } from 'svelte/legacy';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { BookingPlan } from '@controllers/booking_plan';
	import { Department } from '@controllers/department';
	import { Customer } from '@controllers/customer';
	import { Service } from '@controllers/service';
	import { Resource } from '@controllers/resource';
	import { getTimeZone, formatPhoneDisplay, formatDate } from '@utils/function';
	import { getRecurrenceText } from '@functions/reservation_plans';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';
	import Select from '@components/Select.svelte';
	import PhoneNumberInput from '@components/custom/PhoneNumberInput.svelte';
	import Modal from '@components/Modal.svelte';
	import CustomerSelector from '@components/custom/reservation/CustomerSelector.svelte';
	import DayPicker from '@components/custom/reservation_plans/DayPicker.svelte';

	// ── Sayfa Ayarları ─────────────────────────────────────────────────────────
	let isUpdate = $state(false);
	let pageTitle = $state();

	// ── CustomerSelector ─────────────────────────────────────────────────────────
	let showModal = $state(false);
	let selectedCustomerData = $state(null);
	let disableCustomerInputs = $state(false);

	let customersList = $state([]);

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
	let services = $state([]);
	let resources = $state([]);
	let departmentsData = $state([]);
	let availableTimeSlots = $state([]);

	// ── Filtre veriler ─────────────────────────────────────────────────────────
	let filteredServices = $derived(
		selectedDepartment?.value
			? services?.filter((s) => s.department_id == selectedDepartment.value)
			: services
	);
	let filteredResources = $derived(
		selectedService?.value
			? resources?.filter((r) => r.services.some((id) => id == selectedService.value))
			: resources
	);

	// ── Form ─────────────────────────────────────────────────────────
	let bookingPlanId;
	let planName = $state('');
	let customerId = $state('');

	let planNotes = $state('');

	let selectedService = $state({ value: '', name: '' });
	let selectedDepartment = $state({ value: '', name: '' });
	let selectedResource = $state({ value: '', name: '' });
	let status = $state(1);
	let saving = $state(false);

	let startDate = $state('');
	let timeOfDay = $state('');

	let recurrenceType = $state(); // [{val:1, name:günlük}, {val:2, name: haftalık}, {val:3, name:aylık}]
	let recurrenceEvery = $state(1);
	let recurrenceDays = $state([]);
	let totalOccurrences = $state(2);

	// Summary
	let customerName = $state('');
	let customerPhone = $state('');
	let customerMail = $state('');

	let recurrenceText = $derived.by(() => {
		if (recurrenceDays && recurrenceEvery && recurrenceType) {
			return getRecurrenceText(recurrenceType, recurrenceEvery, recurrenceDays);
		}
		return '';
	});

	// ── Slot filtre ayarları ─────────────────────────────────────────────────────────
	const date = new Date();
	const today = date.toISOString().split('T')[0];

	let isReady = $derived(customerId && selectedService);
	let initials = $derived(
		customerName
			? customerName
					.split(' ')
					.map((w) => w[0])
					.join('')
					.slice(0, 2)
					.toUpperCase()
			: null
	);

	async function getCustomers() {
		let res = await Customer.getAll();

		return res;
	}
	async function getDepartments() {
		let res = await Department.getByCompanyId();

		const department = res?.find((x) => x.id == selectedDepartment.value);
		selectedDepartment.name = department ? department.name : '';
		return res;
	}

	async function getServices() {
		let res = await Service.getByCompanyId();

		const service = res?.find((x) => x.id == selectedService.value);
		selectedService.name = service ? service.name : '';

		return res;
	}

	async function getResources() {
		let res = await Resource.getAll();

		const unit = res?.find((x) => x.id == selectedResource.value);
		selectedResource.name = unit ? unit.data.name : '';

		return res;
	}

	async function getInputDatas() {
		[customersList, departmentsData, services, resources] = await Promise.all([
			getCustomers(),
			getDepartments(),
			getServices(),
			getResources()
		]);
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
			resource_id: selectedResource.value,
			department_id: selectedDepartment.value,
			company_id: getCompanyId(), //güncellenecek
			status,
			notes: planNotes,
			start_date: startDate,
			time_of_day: timeOfDay,
			name: planName,
			total_occurrences: totalOccurrences,
			recurrence_days: recurrenceDays,
			recurrence_every: recurrenceEvery,
			recurrence_type: recurrenceType,
			timezone: getTimeZone()
		};

		let res;

		if (isUpdate) {
			data.id = bookingPlanId;
			res = await BookingPlan.updateBooking(data);
		} else {
			res = await BookingPlan.create(data);
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
				goto('/reservation-plans');
			}
		}, 500);
	}

	onMount(async () => {
		if ($page.params.page == 'create') {
			pageTitle = 'Yeni Randevu';
		} else if ($page.params.page == 'update') {
			pageTitle = 'Randevuyu Düzenle';
			isUpdate = true;
		} else {
			goto('/reservation-plans');
		}

		if (isUpdate) {
			let res = await BookingPlan.getPlanByID($page.params.id);

			if (res) {
				bookingPlanId = res.id;
				planName = res.name;
				customerId = res.customerId;
				customerName = res.customer.name;
				customerPhone = res.customer.phone1;
				customerMail = res.customer.mail;

				startDate = res.start_date ? res.start_date.split('T')[0] : '';
				timeOfDay = res.time_of_day;

				status = res.status;
				planNotes = res.description;

				selectedDepartment.value = res.service.department_id;
				selectedService.value = res.service.id;

				recurrenceDays = res.recurrence_days ?? [];
				recurrenceEvery = res.recurrence_every;
				recurrenceType = res.recurrence_type;
				totalOccurrences = res.total_occurrences;
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
	<button class="back-btn" onclick={() => goto('/reservation-plans')}>
		<i class="bx bx-arrow-back"></i>
		Randevu Planları
	</button>
</div>

<div class="panel-layout">
	<Card>
		<div class="body-wrapper p-4">
			<Row>
				{#if !isUpdate}
					<Col width="10">
						<div class="section-title">
							<span class="section-num">01</span>
							<div class="d-flex flex-column">
								<span>Müşteri Bilgileri</span>
								<small class="text-danger" style="font-size: 9px;"
									>Bu alanda müşteri seçimi zorunludur</small
								>
							</div>
						</div>
					</Col>
					<Col width="2">
						<div class="d-flex justify-content-end align-items-center gap-3">
							{#if selectedCustomerData}
								<div>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span class="unselect-user" onclick={unselectCustomer}>Seçimi kaldır</span>
								</div>
							{/if}
							<button
								class="t-btn"
								style="background-color: #f46481; padding: 5px 10px; border-radius: 4px;
							color:white; border:none;"
								onclick={() => (showModal = true)}
							>
								Müşteri Seçin*
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
							autoFilled={disableCustomerInputs}
							disabled={true}
							bind:value={customerName}
							icon={'bx-user'}
						/>
					</Col>
					<Col width="6">
						<label for="f-phone">Cep Telefonu <span class="req">*</span></label>
						<PhoneNumberInput
							id="f-phone"
							autoFilled={disableCustomerInputs}
							disabled={true}
							bind:phoneValue={customerPhone}
						/>
					</Col>
					<Col width="12">
						<label for="f-email">E-posta <span class="opt">isteğe bağlı</span></label>
						<Input
							id="f-email"
							placeholder="ornek@mail.com"
							type="email"
							autoFilled={disableCustomerInputs}
							disabled={true}
							bind:value={customerMail}
							icon={'bx-envelope'}
						/>
					</Col>

					<div class="divider"></div>

					<div class="section-title">
						<span class="section-num">02</span>
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

					<div class="section-title">
						<span class="section-num">03</span>
						Tarih & Saat
					</div>

					<Col width="10">
						<label for="f-date">Tarih <span class="req">*</span></label>
						<div class="input-wrap">
							<Input
								id="f-date"
								min={today}
								bind:value={startDate}
								type="date"
								icon="bx-calendar"
							/>
						</div>
					</Col>
					<Col width="2">
						<label for="f-time">Saat <span class="req">*</span></label>
						<div class="input-wrap">
							<Input id="f-time" type="time" bind:value={timeOfDay} icon="bx-calendar" step={300} />
						</div>
					</Col>

					<Col width="6">
						<label for="">Tekrar tipi</label>
						<Select bind:value={recurrenceType}>
							<option value={1}>Günlük</option>
							<option value={2} selected>Haftalık</option>
							<option value={3}>Aylık</option>
						</Select>
					</Col>

					<Col width="3">
						<label for="f-every">Tekrar <span class="req">*</span></label>
						<div class="input-wrap">
							<Input id="f-every" type="number" bind:value={recurrenceEvery} icon="bx-sync" />
						</div>
					</Col>

					<Col width="3">
						<label for="f-total">Toplam Randevu Sayısı <span class="req">*</span></label>
						<div class="input-wrap">
							<Input id="f-total" type="number" bind:value={totalOccurrences} icon="bx-sync" />
						</div>
					</Col>

					{#if recurrenceType == 2}
						<Col width="12">
							<DayPicker bind:selected={recurrenceDays} label="Hangi Günler Tekrar Etsin?" />
						</Col>
					{/if}
					<div class="divider"></div>
				{/if}

				<div class="section-title">
					<span class="section-num">{isUpdate ? '01' : '04'}</span>
					Genel Bilgiler
				</div>
				<Col width="12">
					<label for="f-title">Plan Adı <span class="req">*</span></label>
					<div class="input-wrap">
						<Input
							id="f-title"
							icon="bx-edit"
							bind:value={planName}
							placeholder="Ayşe Hanım 10'lu Lazer Paketi"
						/>
					</div>
				</Col>

				<Col width="12">
					<label for="f-notes">Notlar <span class="opt">isteğe bağlı</span></label>
					<Input
						id="f-notes"
						type="textarea"
						placeholder="randevuyla ilgili notlar..."
						bind:value={planNotes}
					/>
				</Col>
				<Col>
					<label for="f-status">Durum</label>
					<div class="status-toggle">
						<button
							class="toggle-btn {status == 1 ? 'active' : ''}"
							onclick={() => (status = 1)}
							type="button"
						>
							<i class="bx bx-check-circle"></i> Aktif
						</button>
						<button
							class="toggle-btn danger {status == 0 ? 'active-danger' : ''}"
							onclick={() => (status = 0)}
							type="button"
						>
							<i class="bx bx-x-circle"></i> Pasif
						</button>
					</div>
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
						<span class="sl-key"><i class="bx bx-briefcase"></i> İlk Randevu</span>
						<span class="sl-val {startDate ? '' : 'empty'}">{formatDate(startDate, 9) || '—'}</span>
					</li>
					<li>
						<span class="sl-key"><i class="bx bx-briefcase"></i> Tercih Edilen Saat</span>
						<span class="sl-val {timeOfDay ? '' : 'empty'}">{timeOfDay?.slice(0, 5) || '—'}</span>
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
						<span class="value">Toplam Randevu Sayısı: {totalOccurrences}</span>
					</div>
				{/if}
				<!-- Notes -->
				{#if planNotes}
					<div class="summary-note">
						<i class="bx bx-note"></i>
						<span>{planNotes}</span>
					</div>
				{/if}

				<div class="divider"></div>

				<!-- Status Badge -->
				<div class="summary-status">
					<span class="status-dot {status == 1 ? 'green' : 'red'}"></span>
					{status == 1 ? 'Aktif Randev' : 'Pasif Randev'}
				</div>

				<!-- Save -->
				<button
					class="save-btn my-3 {isReady ? '' : 'disabled'}"
					onclick={isReady ? handleSave : null}
					disabled={!isReady || saving}
					type="button"
				>
					{#if saving}
						<i class="bx bx-loader-alt bx-spin"></i> Kaydediliyor…
					{:else if !isReady}
						<i class="bx bx-lock-alt"></i> Alanları doldurun
					{:else}
						<i class="bx bx-save"></i> Randevuyu Kaydet
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
