<script>
	import { formatDate, initials, avatarColor } from '@utils/function';
	import Card from '@components/Card.svelte';
	import PageHeader from '@components/PageHeader.svelte';
	import Badge from '@components/Badge.svelte';
	import DataTable from '@components/DataTable.svelte';
	import { User } from '@controllers/user';
	import { ROLES } from '@constants/roles';
	import { onMount } from 'svelte';
	import Modal from '@components/Modal.svelte';
	import Confirmation from '@components/helpers/Confirmation.svelte';
	import { goto } from '$app/navigation';

	let loading = false;

	let users = [];

	let formData = {
		name: '',
		mail: '',
		username: '',
		password: '',
		type: 2,
		active: 1
	};

	// DELETE
	let showModal = false;
	let selectedUser;

	async function handleDeleteUser() {
		let res = await User.delete(selectedUser.id);
		if (res) {
			selectedUser = null;
			users = users.filter((x) => x.id != res.data.id);
		}

		showModal = false;
	}

	// --- YETKİ VE ROL ALTYAPISI ---
	let roles = [
		{
			id: 1,
			title: 'Süper Admin',
			desc: 'Sistemdeki her şeye tam erişim sağlar.',
			theme: 'purple'
		},
		{
			id: 2,
			title: 'Personel',
			desc: 'Sadece randevuları görebilir ve yönetebilir.',
			theme: 'orange'
		}
	];

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
			users = res;
		}
	}

	function getRole(type) {
		let role;
		role = roles.filter((x) => x.id == type)[0];
		if (!role) {
			return { id: 0, title: 'Bilinmeyen' };
		}
		return role;
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
	<DataTable data={users}>
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
							<td class="text-center"
								><Badge theme={getRole(user.type).theme}>{getRole(user.type).title}</Badge></td
							>
							<td class="text-center">
								{#if user.active == 0}
									<Badge danger>Pasif</Badge>
								{:else if user.active == 1}
									<Badge primary>Aktif</Badge>
								{/if}
							</td>
							<td>
								<div class="row-actions">
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span class="action-btn edit" on:click={() => goto(`users/update/${user.id}`)}>
										<i class="bx bx-edit-alt"></i>
									</span>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<span
										class="action-btn delete"
										on:click={() => {
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
</style>
