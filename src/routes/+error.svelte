<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const status = page.status;
	const message = page.error?.message ?? 'Sayfa Bulunamadı';
</script>

<svelte:head>
	<title>{status} — Xess Booking</title>
</svelte:head>

<div class="space-bg">
	<!-- Stars -->
	<div class="stars" aria-hidden="true">
		{#each Array(120) as _, i}
			<span
				class="star"
				style="
				--x: {Math.random() * 100}%;
				--y: {Math.random() * 100}%;
				--size: {Math.random() * 2.5 + 0.5}px;
				--delay: {Math.random() * 4}s;
				--dur: {Math.random() * 3 + 2}s;
			"
			></span>
		{/each}
	</div>

	<!-- Floating planets / orbs -->
	<div class="orb orb-1" aria-hidden="true"></div>
	<div class="orb orb-2" aria-hidden="true"></div>
	<div class="orb orb-3" aria-hidden="true"></div>

	<!-- Main content -->
	<div class="content">
		<!-- Astronaut SVG icon -->
		<div class="astronaut" aria-hidden="true">
			<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
				<!-- Suit body -->
				<ellipse
					cx="100"
					cy="140"
					rx="42"
					ry="48"
					fill="#e8eaf6"
					stroke="#9fa8da"
					stroke-width="2"
				/>
				<!-- Helmet -->
				<circle cx="100" cy="82" r="36" fill="#e8eaf6" stroke="#9fa8da" stroke-width="2" />
				<!-- Visor -->
				<ellipse
					cx="100"
					cy="82"
					rx="22"
					ry="20"
					fill="url(#visor)"
					stroke="#7986cb"
					stroke-width="1.5"
				/>
				<!-- Reflection on visor -->
				<ellipse
					cx="91"
					cy="74"
					rx="6"
					ry="5"
					fill="rgba(255,255,255,0.4)"
					transform="rotate(-20 91 74)"
				/>
				<!-- Left arm -->
				<path
					d="M58 120 Q40 130 44 155"
					stroke="#9fa8da"
					stroke-width="14"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="44" cy="157" r="8" fill="#7986cb" />
				<!-- Right arm -->
				<path
					d="M142 120 Q160 130 156 155"
					stroke="#9fa8da"
					stroke-width="14"
					stroke-linecap="round"
					fill="none"
				/>
				<circle cx="156" cy="157" r="8" fill="#7986cb" />
				<!-- Left leg -->
				<path
					d="M82 182 Q78 196 72 200"
					stroke="#9fa8da"
					stroke-width="12"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Right leg -->
				<path
					d="M118 182 Q122 196 128 200"
					stroke="#9fa8da"
					stroke-width="12"
					stroke-linecap="round"
					fill="none"
				/>
				<!-- Chest panel -->
				<rect x="85" y="128" width="30" height="20" rx="5" fill="#7986cb" opacity="0.6" />
				<circle cx="94" cy="138" r="3" fill="#f53658" />
				<circle cx="106" cy="138" r="3" fill="#69f0ae" />
				<!-- Oxygen hose -->
				<path
					d="M58 120 Q30 110 28 85 Q28 68 44 68"
					stroke="#7986cb"
					stroke-width="3"
					stroke-dasharray="5,3"
					fill="none"
				/>
				<!-- Gradient def -->
				<defs>
					<linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#1a237e" stop-opacity="0.9" />
						<stop offset="100%" stop-color="#283593" stop-opacity="0.7" />
					</linearGradient>
				</defs>
			</svg>
		</div>

		<!-- 404 number -->
		<div class="error-code">
			<span class="digit">4</span>
			<span class="digit planet-zero">0</span>
			<span class="digit">4</span>
		</div>

		<h1 class="title">Kayboldu Gittiniz!</h1>
		<p class="subtitle">
			{#if status === 404}
				Aradığınız sayfa galaksinin derinliklerinde kayboldu.<br />
				Belki hiç var olmadı, ya da başka bir evrene taşındı.
			{:else}
				{message}
			{/if}
		</p>

		<div class="actions">
			<button class="btn-primary" onclick={() => goto('/')}>
				<svg
					viewBox="0 0 24 24"
					width="18"
					height="18"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
					<polyline points="9 21 9 12 15 12 15 21" />
				</svg>
				Ana Sayfaya Dön
			</button>
			<button class="btn-ghost" onclick={() => history.back()}>
				<svg
					viewBox="0 0 24 24"
					width="18"
					height="18"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="15 18 9 12 15 6" />
				</svg>
				Geri Git
			</button>
		</div>

		<p class="error-hint">Hata kodu: <code>{status}</code></p>
	</div>
</div>

<style>
	/* ===== BACKGROUND ===== */
	.space-bg {
		min-height: 100vh;
		background: radial-gradient(ellipse at 20% 50%, #1a0a2e 0%, #0d0520 40%, #060312 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		font-family: 'Segoe UI', system-ui, sans-serif;
	}

	/* ===== STARS ===== */
	.stars {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.star {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: white;
		animation: twinkle var(--dur) var(--delay) ease-in-out infinite alternate;
	}

	@keyframes twinkle {
		0% {
			opacity: 0.15;
			transform: scale(1);
		}
		100% {
			opacity: 1;
			transform: scale(1.4);
		}
	}

	/* ===== ORBS (planets) ===== */
	.orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(1px);
		animation: drift 18s ease-in-out infinite alternate;
	}

	.orb-1 {
		width: 180px;
		height: 180px;
		background: radial-gradient(circle at 35% 35%, #7c3aed, #4c1d95);
		top: -60px;
		right: 8%;
		opacity: 0.55;
		animation-duration: 20s;
	}

	.orb-2 {
		width: 100px;
		height: 100px;
		background: radial-gradient(circle at 40% 30%, #f53658, #7f1d3a);
		bottom: 10%;
		left: 5%;
		opacity: 0.5;
		animation-duration: 15s;
		animation-delay: 3s;
	}

	.orb-3 {
		width: 60px;
		height: 60px;
		background: radial-gradient(circle at 40% 30%, #38bdf8, #0369a1);
		top: 30%;
		left: 12%;
		opacity: 0.45;
		animation-duration: 12s;
		animation-delay: 6s;
	}

	@keyframes drift {
		0% {
			transform: translateY(0px) rotate(0deg);
		}
		100% {
			transform: translateY(30px) rotate(8deg);
		}
	}

	/* ===== CONTENT ===== */
	.content {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem;
		max-width: 560px;
		width: 100%;
	}

	/* ===== ASTRONAUT ===== */
	.astronaut {
		width: 160px;
		height: 160px;
		margin-bottom: 1rem;
		animation: float 4s ease-in-out infinite;
		filter: drop-shadow(0 0 24px rgba(121, 134, 203, 0.5));
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(-2deg);
		}
		50% {
			transform: translateY(-18px) rotate(2deg);
		}
	}

	/* ===== 404 NUMBER ===== */
	.error-code {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 0.6rem;
	}

	.digit {
		font-size: clamp(5rem, 14vw, 9rem);
		font-weight: 900;
		line-height: 1;
		background: linear-gradient(135deg, #fff 30%, #c4b5fd 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -4px;
	}

	/* The "0" in 404 styled as a planet/ring */
	.planet-zero {
		position: relative;
		background: linear-gradient(135deg, #f53658 0%, #ff6b9d 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: spin-pulse 3s ease-in-out infinite;
	}

	@keyframes spin-pulse {
		0%,
		100% {
			filter: brightness(1);
			transform: scale(1);
		}
		50% {
			filter: brightness(1.3);
			transform: scale(1.05);
		}
	}

	/* ===== TEXT ===== */
	.title {
		font-size: clamp(1.4rem, 4vw, 2rem);
		font-weight: 700;
		color: #fff;
		margin: 0 0 0.75rem;
	}

	.subtitle {
		font-size: 0.95rem;
		color: rgba(196, 181, 253, 0.8);
		line-height: 1.7;
		margin: 0 0 2rem;
	}

	/* ===== BUTTONS ===== */
	.actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.btn-primary,
	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 11px 22px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition:
			transform 150ms ease,
			box-shadow 150ms ease,
			background 150ms ease;
	}

	.btn-primary {
		background: linear-gradient(135deg, #f53658, #c8215c);
		color: #fff;
		box-shadow: 0 6px 24px rgba(245, 54, 88, 0.4);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 32px rgba(245, 54, 88, 0.55);
	}

	.btn-ghost {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.85);
		border: 1px solid rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(8px);
	}

	.btn-ghost:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	/* ===== HINT ===== */
	.error-hint {
		font-size: 12px;
		color: rgba(196, 181, 253, 0.45);
		margin: 0;
	}

	.error-hint code {
		background: rgba(255, 255, 255, 0.1);
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 12px;
		color: rgba(196, 181, 253, 0.7);
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 480px) {
		.astronaut {
			width: 120px;
			height: 120px;
		}
		.actions {
			flex-direction: column;
			align-items: center;
		}
		.btn-primary,
		.btn-ghost {
			width: 200px;
			justify-content: center;
		}
	}
</style>
