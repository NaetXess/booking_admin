<script>
	import { formatDate, initials, avatarColor } from '@utils/function';
	import Card from '@components/Card.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import Badge from '@components/Badge.svelte';
	import DataTable from '@components/DataTable.svelte';
	import Input from '@components/Input.svelte';
	import { User } from '@controllers/user';
	import { ROLES } from '@constants/roles';
	import { onMount } from 'svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';
	import { goto } from '$app/navigation';
	import { getRoleDetails } from '@constants/roles';

	let loading = $state(false);

	let users = $state([]);
	let paginationData = $state({});

	let formData = {
		name: '',
		mail: '',
		username: '',
		password: '',
		type: 2,
		active: 1
	};

	// DELETE
	let showModal = $state(false);
	let selectedUser = $state();

	async function handleDeleteUser() {
		let res = await User.delete(selectedUser.id);
		if (res) {
			selectedUser = null;
			users = users.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	// RESET PASSWORD
	let showResetModal = $state(false);
	let resetPasswordUser = $state(null);
	let newPassword = $state('');
	let isResetting = $state(false);

	async function handleResetPassword() {
		if (!newPassword || newPassword.length < 6) {
			alert('Şifre en az 6 karakter olmalıdır.');
			return;
		}

		isResetting = true;
		let res = await User.resetPassword({
			id: resetPasswordUser.id,
			password: newPassword
		});
		isResetting = false;

		if (res) {
			showResetModal = false;
			resetPasswordUser = null;
			newPassword = '';
		}
	}

	// Personel seçildiğinde açılıp kapanabilecek basit detaylı yetkiler
	let permissions = [
		{ key: 'view_res', label: 'Rezervasyonları Görebilir', state: true },
		{ key: 'edit_res', label: 'Rezervasyon Oluşturabilir/Silebilir', state: true },
		{ key: 'manage_customers', label: 'Müşteri Kayıtlarını Görüntüleyebilir', state: false },
		{ key: 'view_reports', label: 'Finans ve Raporları Görebilir', state: false }
	];

	async function getUsers() {
		let res = await User.getAllByCompanyId();
		if (res) {
			paginationData = res;
			users = paginationData.items;
		}
	}

	// INIT
	onMount(init);

	async function init() {
		loading = true;
		await getUsers();
		loading = false;
	}
</script>

<svelte:head>
	<title>Kullanıcılar | Xess Booking</title>
	<meta name="description" content="Panele erişimi olacak kullanıcıları düzenleyin." />
</svelte:head>

<PageHeader
	title="Kullanıcılar"
	subTitle="Tüm kullanıcıları buradan yönetebilirsiniz."
	url="/users/create/new"
	btnTitle="Yeni Kullanıcı"
/>

<Card>
	<DataTable data={paginationData}>
		<table>
			<thead>
				<tr>
					<th>Adı</th>
					<th class="text-center">Mail</th>
					<th class="text-center">Kullanıcı Adı</th>
					<th class="text-center">ROL</th>
					<th class="text-center">AKTİF</th>
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
				{:else if users && users.length > 0}
					{#each users as user}
						{@const role = getRoleDetails(user.type)}
						<tr>
							<td>
								<div class="user-cell">
									<div class="avatar" style="background-color:{avatarColor(user.name)}">
										{initials(user.name).toUpperCase()}
									</div>
									<span class="bold">{user.name}</span>
								</div>
							</td>
							<td class="text-center">
								<div class="contact-cell">
									<i class="bx bx-mail"></i>
									{user.mail}
								</div>
							</td>
							<td class="text-center"><span class="fw-bold">{user.username}</span></td>
							<td class="text-center"><Badge theme={role.theme}>{role.title}</Badge></td>
							<td class="text-center">
								{#if user.active == 0}
									<Badge danger>Pasif</Badge>
								{:else if user.active == 1}
									<Badge primary>Aktif</Badge>
								{/if}
							</td>
							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn key"
										onclick={() => {
											resetPasswordUser = user;
											newPassword = '';
											showResetModal = true;
										}}
										title="Şifre Sıfırla"
									>
										<i class="bx bx-key"></i>
									</span>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span class="action-btn edit" onclick={() => goto(`users/update/${user.id}`)}>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="action-btn delete"
										onclick={() => {
											showModal = true;
											selectedUser = user;
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
								Henüz kullanıcı bulunmuyor.
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</DataTable>
</Card>

<Modal bind:show={showModal} title="Kullanıcı Silme">
	<Confirmation
		boldWord={selectedUser.name}
		text={`kullanıcısını silmek üzeresiniz! İşleme devam edilsin mi?`}
		on:cancel={() => {
			showModal = false;
			selectedUser = null;
		}}
		on:confirm={handleDeleteUser}
	/>
</Modal>

<Modal bind:show={showResetModal} title="Şifre Sıfırla">
	{#if resetPasswordUser}
		<div class="reset-modal-content">
			<div class="reset-info">
				<strong>{resetPasswordUser.name}</strong> kullanıcısı için yeni bir şifre girin.
			</div>
			
			<div class="input-container">
				<Input
					id="reset-password-field"
					type="password"
					bind:value={newPassword}
					icon="bx-lock-alt"
					placeholder="Yeni Şifre"
				/>
			</div>

			<div class="modal-buttons">
				<button class="modal-btn cancel" onclick={() => { showResetModal = false; resetPasswordUser = null; }}>
					Vazgeç
				</button>
				<button class="modal-btn confirm" onclick={handleResetPassword} disabled={isResetting}>
					{isResetting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
				</button>
			</div>
		</div>
	{/if}
</Modal>

<style>
	.user-cell {
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

	/* Reset Password Styles */
	:global(.row-actions .action-btn.key:hover) {
		background: rgba(255, 159, 67, 0.1) !important;
		color: #ff9f43 !important;
	}
	.reset-modal-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 340px;
		padding: 6px;
	}
	.reset-info {
		font-size: 13.5px;
		color: #445471;
		line-height: 1.5;
	}
	.input-container {
		width: 100%;
	}
	.modal-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 6px;
	}
	.modal-btn {
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: opacity 150ms;
	}
	.modal-btn:hover {
		opacity: 0.9;
	}
	.modal-btn.cancel {
		background: #f0f2f5;
		color: #445471;
	}
	.modal-btn.confirm {
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
	}
</style>
