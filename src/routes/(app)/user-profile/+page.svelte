<script>
	import { onMount } from 'svelte';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Input from '@components/Input.svelte';
	import { User } from '@controllers/user';

	let user = $state({
		id: '',
		name: '',
		mail: '',
		username: '',
		type: 2,
		active: 1
	});

	let newPassword = $state('');
	let confirmPassword = $state('');

	let loading = $state(false);
	let savingProfile = $state(false);
	let savingPassword = $state(false);

	async function loadProfile() {
		loading = true;
		let res = await User.getMe();
		if (res) {
			user = {
				id: res.id,
				name: res.name || '',
				mail: res.mail || '',
				username: res.username || '',
				type: res.type,
				active: res.active
			};
		}
		loading = false;
	}

	async function handleUpdateProfile() {
		if (!user.name || !user.mail || !user.username) {
			alert('Lütfen tüm alanları doldurun.');
			return;
		}

		savingProfile = true;
		let res = await User.update(user);
		savingProfile = false;
	}

	async function handleUpdatePassword() {
		if (!newPassword || newPassword.length < 6) {
			alert('Şifre en az 6 karakter olmalıdır.');
			return;
		}

		if (newPassword !== confirmPassword) {
			alert('Girdiğiniz şifreler eşleşmiyor.');
			return;
		}

		savingPassword = true;
		let res = await User.resetPassword({
			id: user.id,
			password: newPassword
		});
		savingPassword = false;

		if (res) {
			newPassword = '';
			confirmPassword = '';
		}
	}

	onMount(loadProfile);
</script>

<svelte:head>
	<title>Profilim | Xess Booking</title>
	<meta name="description" content="Profil bilgilerinizi ve şifrenizi güncelleyin." />
</svelte:head>

<div class="profile-page">
	<div class="profile-header mb-4">
		<h5 class="page-title">Profil Ayarları</h5>
		<p class="page-sub">Kişisel bilgilerinizi ve hesap şifrenizi buradan yönetebilirsiniz.</p>
	</div>

	{#if loading}
		<div class="loader-wrap">
			<i class="bx bx-loader-alt bx-spin"></i>
			<span>Yükleniyor...</span>
		</div>
	{:else}
		<Row>
			<!-- Profil Bilgileri -->
			<Col width="6">
				<div class="t-card">
					<div class="card-header">
						<div>
							<span class="card-title">Profil Bilgileri</span>
							<span class="card-sub">Adınız, e-posta adresiniz ve kullanıcı adınız</span>
						</div>
					</div>

					<div class="form-body">
						<div class="input-group-custom">
							<label for="p-name">Ad Soyad</label>
							<Input id="p-name" type="text" bind:value={user.name} icon="bx-user" placeholder="Ad Soyad" />
						</div>

						<div class="input-group-custom">
							<label for="p-mail">E-Posta Adresi</label>
							<Input id="p-mail" type="email" bind:value={user.mail} icon="bx-envelope" placeholder="E-Posta" />
						</div>

						<div class="input-group-custom">
							<label for="p-username">Kullanıcı Adı</label>
							<Input id="p-username" type="text" bind:value={user.username} icon="bx-at" placeholder="Kullanıcı Adı" />
						</div>

						<button class="profile-btn save" onclick={handleUpdateProfile} disabled={savingProfile}>
							{#if savingProfile}
								<i class="bx bx-loader-alt bx-spin"></i> Güncelleniyor...
							{:else}
								<i class="bx bx-save"></i> Değişiklikleri Kaydet
							{/if}
						</button>
					</div>
				</div>
			</Col>

			<!-- Şifre Değiştir -->
			<Col width="6">
				<div class="t-card">
					<div class="card-header">
						<div>
							<span class="card-title">Güvenlik & Şifre</span>
							<span class="card-sub">Oturum şifrenizi güncelleyin</span>
						</div>
					</div>

					<div class="form-body">
						<div class="input-group-custom">
							<label for="p-new-password">Yeni Şifre</label>
							<Input id="p-new-password" type="password" bind:value={newPassword} icon="bx-lock-open-alt" placeholder="Yeni Şifre" />
						</div>

						<div class="input-group-custom">
							<label for="p-confirm-password">Yeni Şifre (Tekrar)</label>
							<Input id="p-confirm-password" type="password" bind:value={confirmPassword} icon="bx-lock-alt" placeholder="Yeni Şifre (Tekrar)" />
						</div>

						<div class="pass-hint">
							<i class="bx bx-info-circle"></i>
							Şifreniz en az 6 karakter uzunluğunda olmalıdır.
						</div>

						<button class="profile-btn key-btn" onclick={handleUpdatePassword} disabled={savingPassword}>
							{#if savingPassword}
								<i class="bx bx-loader-alt bx-spin"></i> Güncelleniyor...
							{:else}
								<i class="bx bx-key"></i> Şifreyi Güncelle
							{/if}
						</button>
					</div>
				</div>
			</Col>
		</Row>
	{/if}
</div>

<style>
	.profile-page {
		padding-bottom: 24px;
	}
	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: #252c38;
		margin: 0;
	}
	.page-sub {
		font-size: 13px;
		color: #7a8699;
		margin: 0;
		margin-top: 3px;
	}

	.t-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		height: 100%;
	}
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding-bottom: 12px;
		border-bottom: 1.5px solid #f0f2f5;
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

	.form-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.input-group-custom {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.input-group-custom label {
		font-size: 12px;
		font-weight: 600;
		color: #445471;
	}

	.profile-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 10px 16px;
		border-radius: 8px;
		border: none;
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		transition: transform 100ms ease, opacity 100ms ease, box-shadow 100ms ease;
		width: 100%;
		margin-top: 8px;
	}
	.profile-btn:hover {
		transform: translateY(-1px);
		opacity: 0.95;
	}
	.profile-btn:active {
		transform: translateY(0);
	}
	.profile-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	.profile-btn.save {
		background: linear-gradient(135deg, #11CDEF, #1193EF);
		color: white;
		box-shadow: 0 4px 12px rgba(17, 205, 239, 0.2);
	}
	.profile-btn.save:hover {
		box-shadow: 0 6px 16px rgba(17, 205, 239, 0.35);
	}
	.profile-btn.key-btn {
		background: linear-gradient(135deg, #f5365c, #f4226d);
		color: white;
		box-shadow: 0 4px 12px rgba(245, 54, 92, 0.2);
	}
	.profile-btn.key-btn:hover {
		box-shadow: 0 6px 16px rgba(245, 54, 92, 0.35);
	}

	.pass-hint {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		color: #7a8699;
		background: #f8f9fa;
		border: 1px solid #ebedf0;
		padding: 8px 12px;
		border-radius: 8px;
	}
	.pass-hint i {
		font-size: 14px;
		color: #f5365c;
	}

	.loader-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 250px;
		color: #7a8699;
		font-size: 14px;
	}
	.loader-wrap i {
		font-size: 32px;
		color: #f5365c;
	}
</style>
