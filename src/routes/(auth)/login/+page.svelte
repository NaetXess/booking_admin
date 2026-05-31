<script>
	import { goto } from '$app/navigation';
	import { User } from '@controllers/user';

	let userName;
	let password;
	let rememberMe = true;

	let disableBtn = false;

	async function login() {
		let res = await User.login({ username: userName, password, remember: rememberMe });
		console.log(res);

		if (res) {
			localStorage.setItem('user', JSON.stringify(res.data[0]));
			return true;
		}

		return false;
	}

	async function handleLogin() {
		disableBtn = true;
		let isOK = await login();
		if (isOK) {
			setTimeout(() => {
				disableBtn = false;
				goto('/');
			}, 500);
		} else {
			disableBtn = false;
		}
	}
</script>

<svelte:head>
	<title>Giriş Yap | Xess Booking</title>
	<meta name="description" content="Admin paneline giriş yapın." />
</svelte:head>

<div class="split-screen">
	<div class="panel left-panel">
		<div class="left-content">
			<div class="brand-header">
				<div class="brand-logo">
					<i class="bx bx-calendar-check"></i>
				</div>
				<div>
					<h2 class="brand-name">Xess Booking</h2>
					<p class="brand-tagline">Randevu & Rezervasyon Paneli</p>
				</div>
			</div>

			<div class="promo-area">
				<div class="promo-badge">🎉 Yenilik</div>
				<h3 class="promo-title">Tüm rezervasyonlarınız tek panelde!</h3>
				<p class="promo-desc">
					Günlük rezervasyon takibi, personel yönetimi ve detaylı raporlarla işletmenizi daha
					verimli yönetin.
				</p>

				<div class="feature-list">
					<div class="feature-item">
						<div class="feature-icon">
							<i class="bx bx-check-circle"></i>
						</div>
						<span>Anlık rezervasyon takibi</span>
					</div>
					<div class="feature-item">
						<div class="feature-icon">
							<i class="bx bx-check-circle"></i>
						</div>
						<span>Departman & personel yönetimi</span>
					</div>
					<div class="feature-item">
						<div class="feature-icon">
							<i class="bx bx-check-circle"></i>
						</div>
						<span>Gelişmiş raporlama araçları</span>
					</div>
					<!-- <div class="feature-item">
						<div class="feature-icon">
							<i class="bx bx-check-circle"></i>
						</div>
						<span>Mobil uyumlu arayüz</span>
					</div> -->
				</div>
			</div>

			<div class="promo-footer">
				<div class="stat-item">
					<span class="stat-num">10+</span>
					<span class="stat-label">İşletme</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat-item">
					<span class="stat-num">80+</span>
					<span class="stat-label">Günlük Rezervasyon</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat-item">
					<span class="stat-num">%99</span>
					<span class="stat-label">Memnuniyet</span>
				</div>
			</div>
		</div>
	</div>

	<div class="panel right-panel">
		<div class="right-overlay"></div>
		<div class="right-content">
			<div class="login-card">
				<div class="login-card-header">
					<i class="bx bx-log-in-circle header-icon"></i>
					<h4>Giriş Yap</h4>
					<p>Hesabınıza erişmek için bilgilerinizi girin</p>
				</div>

				<div class="login-form">
					<div class="input-wrapper">
						<i class="bx bx-user input-icon"></i>
						<input type="text" placeholder="Kullanıcı Adı" bind:value={userName} />
					</div>
					<div class="input-wrapper">
						<i class="bx bx-lock-alt input-icon"></i>
						<input type="password" placeholder="Şifre" bind:value={password} />
					</div>

					<div class="form-extras">
						<div class="d-flex align-items-center gap-2">
							<label class="switch">
								<input id="remember-me" type="checkbox" bind:checked={rememberMe} />
								<span class="slider"></span>
							</label>
							<label for="remember-me" class="lb-remember">Beni Hatırla</label>
						</div>
						<a href="" class="forgot-link">Şifremi Unuttum</a>
					</div>

					<button class="sign-in-btn" disabled={disableBtn} on:click={handleLogin}>
						<i class="bx bx-log-in"></i>
						Giriş Yap
					</button>

					<p class="register-text">
						Bir hesabınız yok mu?
						<a href="" class="register-link">Kaydolun ve başlayın!</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* ===== SPLIT SCREEN WRAPPER ===== */
	.split-screen {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 100vh;
		overflow: hidden;
	}

	.panel {
		position: relative;
		height: 100%;
	}

	/* ===== SOL PANEL ===== */
	.left-panel {
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1px solid #f0f0f0;
	}

	.left-content {
		width: 80%;
		max-width: 420px;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.brand-header {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.brand-logo {
		width: 52px;
		height: 52px;
		border-radius: 14px;
		background: linear-gradient(135deg, rgba(245, 54, 92, 1) 0%, rgba(200, 30, 70, 1) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 14px rgba(245, 54, 92, 0.35);
		flex-shrink: 0;
	}

	.brand-logo i {
		font-size: 26px;
		color: white;
	}

	.brand-name {
		font-size: 22px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.2;
	}

	.brand-tagline {
		font-size: 12px;
		color: #999;
		margin: 0;
	}

	/* ---- Promo Alanı ---- */
	.promo-badge {
		display: inline-block;
		background-color: rgba(245, 54, 92, 0.1);
		color: #f53658;
		border-radius: 20px;
		padding: 4px 14px;
		font-size: 12px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.promo-title {
		font-size: 22px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 10px;
		line-height: 1.35;
	}

	.promo-desc {
		font-size: 14px;
		color: #666;
		line-height: 1.65;
		margin: 0 0 20px;
	}

	.feature-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
		color: #444;
	}

	.feature-icon {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background-color: rgba(245, 54, 92, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.feature-icon i {
		font-size: 15px;
		color: #f53658;
	}

	/* ---- İstatistik Footer ---- */
	.promo-footer {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px 24px;
		background-color: #fafafa;
		border: 1px solid #f0f0f0;
		border-radius: 14px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.stat-num {
		font-size: 20px;
		font-weight: 700;
		color: #f53658;
	}

	.stat-label {
		font-size: 11px;
		color: #999;
		margin-top: 2px;
		text-align: center;
	}

	.stat-divider {
		width: 1px;
		height: 36px;
		background-color: #e8e8e8;
	}

	/* ===== SAĞ PANEL ===== */
	.right-panel {
		background-image: url('/assets/img/bg/login-bg.jpg');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.right-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(160deg, rgba(245, 54, 92, 0.72) 0%, rgba(80, 10, 30, 0.82) 100%);
		z-index: 1;
	}

	.right-content {
		position: relative;
		z-index: 2;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	/* ===== LOGIN KARTI ===== */
	.login-card {
		width: 100%;
		max-width: 380px;
		background: rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 20px;
		padding: 2.2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.login-card-header {
		text-align: center;
		margin-bottom: 1.8rem;
	}

	.header-icon {
		font-size: 40px;
		color: white;
		opacity: 0.9;
	}

	.login-card-header h4 {
		color: white;
		font-size: 22px;
		font-weight: 700;
		margin: 8px 0 4px;
	}

	.login-card-header p {
		color: rgba(255, 255, 255, 0.65);
		font-size: 13px;
		margin: 0;
	}

	/* ===== FORM ===== */
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input-wrapper {
		position: relative;
	}

	.input-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 18px;
		color: rgba(255, 255, 255, 0.7);
		z-index: 1;
	}

	.input-wrapper input {
		width: 100%;
		padding: 12px 14px 12px 40px;
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 10px;
		color: white;
		font-size: 14px;
		outline: none;
		transition:
			border-color 200ms,
			background 200ms;
		box-sizing: border-box;
	}

	.input-wrapper input::placeholder {
		color: rgba(255, 255, 255, 0.55);
	}

	.input-wrapper input:focus {
		border-color: rgba(255, 255, 255, 0.7);
		background: rgba(255, 255, 255, 0.22);
	}

	/* ===== EXTRAS ===== */
	.form-extras {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.lb-remember {
		user-select: none;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.75);
		font-size: 13px;
	}

	.forgot-link {
		font-size: 13px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.85);
		text-decoration: none;
	}

	.forgot-link:hover {
		color: white;
		text-decoration: underline;
	}

	/* ===== BUTON ===== */
	.sign-in-btn {
		width: 100%;
		padding: 12px;
		border: none;
		border-radius: 10px;
		background: white;
		color: #f53658;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition:
			transform 120ms ease,
			box-shadow 150ms ease;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		margin-top: 0.4rem;
	}

	.sign-in-btn i {
		font-size: 18px;
	}

	.sign-in-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 22px rgba(0, 0, 0, 0.28);
	}

	.sign-in-btn:active {
		transform: translateY(0);
	}

	/* ===== KAYIT ===== */
	.register-text {
		text-align: center;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.65);
		margin: 6px 0 0;
	}

	.register-link {
		color: white;
		font-weight: 600;
		text-decoration: none;
	}

	.register-link:hover {
		text-decoration: underline;
	}

	/* ===== TOGGLE SWITCH ===== */
	.switch {
		position: relative;
		display: inline-block;
		width: 35px;
		height: 15px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		inset: 0;
		background-color: rgba(255, 255, 255, 0.3);
		transition: 0.4s;
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 21px;
		width: 21px;
		top: 50%;
		left: 0;
		background-color: white;
		border: 1px solid rgba(255, 255, 255, 0.4);
		transition: 250ms;
		border-radius: 50%;
		transform: translate(0%, -50%);
	}

	input:checked + .slider {
		background-color: rgba(255, 255, 255, 0.6);
	}

	input:checked + .slider:before {
		transform: translateX(15px) translate(0%, -50%);
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 900px) {
		.split-screen {
			grid-template-columns: 1fr;
		}

		.left-panel {
			display: none;
		}
	}
</style>
