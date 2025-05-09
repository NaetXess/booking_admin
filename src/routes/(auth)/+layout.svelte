<script>
</script>

<div class="auth-wrapper">
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.auth-wrapper {
		height: 100vh;
		overflow: hidden;
		background-color: #1b1b1b9f;
		background-image: url('/assets/img/bg/login-bg.jpg');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.auth-wrapper::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(26, 26, 26, 0.4);
		z-index: 1;
	}

	.auth-wrapper .content {
		position: relative;
		z-index: 2;
		height: 100%;
	}
</style>
