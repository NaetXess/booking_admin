<script>
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import { goto } from '$app/navigation';
</script>

<Row classes="h-100">
	<Col md="4" style="offset-md-4 d-flex justify-content-center align-items-center h-100">
		<div class="login-card">
			<div class="header">
				<div class="custom-card pt-2 pb-3">
					<h4 class="mt-4 mb-4">Giriş Yap</h4>
					<div class="text-white mb-4 pt-2 d-flex gap-5 align-items-center">
						<i class="bx bxl-facebook"></i>
						<i class="bx bxl-twitter"></i>
						<i class="bx bxl-google"></i>
					</div>
				</div>
			</div>
			<div class="form px-4">
				<div class="input-wrapper">
					<input type="text" placeholder="Kullanıcı Adı" />
				</div>
				<div class="input-wrapper">
					<input type="text" placeholder="Şifre" />
				</div>
				<div class="switch-wrapper">
					<div class="d-flex align-items-center gap-2">
						<label class="switch">
							<input id="remember-me" type="checkbox" checked />
							<span class="slider"></span>
						</label>
						<label for="remember-me" class="lb-remember">Beni Hatırla</label>
					</div>
					<a href="" class="text-danger text-decoration-none">Şifremi Unuttum</a>
				</div>
			</div>

			<div class="footer mt-5 px-4">
				<div class="text-center">
					<button
						class="sign-in"
						on:click={() => {
							goto('/');
						}}>Giriş Yap</button
					>
				</div>
				<div class="text-center mt-4 mb-4 py-2 sign-up-wrapper">
					<p class="">
						Bir hesabınız yok mu? <a href="" class="text-danger text-decoration-none ms-1"
							>Kaydolun ve başlayın!</a
						>
					</p>
				</div>
			</div>
		</div>
	</Col>
</Row>

<style>
	:root {
		--defaultColor: rgb(136, 136, 136);
	}
	.login-card {
		width: 70%;
		background-color: rgb(255, 255, 255);
		border-radius: 14px;
	}

	.form {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 1rem;
	}

	.form .input-wrapper {
		width: 100%;
		margin-bottom: 10px;
	}

	.form .input-wrapper input {
		width: 100%;

		outline: none;
		border: none;
		border-bottom: 1px solid grey;
		padding-bottom: 10px;
		padding-top: 10px;
	}

	.login-card .header {
		display: flex;
		justify-content: center;
	}

	.login-card .header .custom-card {
		width: 90%;

		transform: translateY(-25px);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		border-radius: 14px;

		background: rgb(27, 27, 27);
		background: linear-gradient(9deg, rgba(27, 27, 27, 1) 0%, rgba(64, 64, 72, 1) 100%);
	}

	.login-card .header .custom-card h4 {
		color: white;
		font-weight: bold;
	}
	.login-card .header .custom-card i {
		color: white;
		font-size: 25px;
	}

	.switch-wrapper {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.lb-remember {
		user-select: none;
		cursor: pointer;
		color: var(--defaultColor);
	}

	.sign-in {
		width: 100%;
		font-size: 14px;
		color: white;
		padding-top: 8px;
		padding-bottom: 8px;
		border: none;
		border-radius: 5px;
		font-weight: 500;

		background: rgb(28, 28, 28);
		background: linear-gradient(9deg, rgba(28, 28, 28, 1) 0%, rgba(57, 57, 63, 1) 100%);
	}

	a {
		font-weight: 500;
	}

	.sign-up-wrapper p {
		color: var(--defaultColor);
	}

	/* Switch kutusunun genel stili */
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
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
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
		border: 1px solid #ccc;
		transition: 250ms;
		border-radius: 50%;
		transform: translate(0%, -50%);
	}

	input:checked + .slider {
		background-color: #2b2b2b;
	}

	input:checked + .slider:before {
		transform: translateX(15px) translate(0%, -50%);
		border: 1px solid #2b2b2b;
	}
</style>
