<script>
	import { page } from '$app/stores';
	import SidenavToggler from '@components/template/SidenavToggler.svelte';
	import { currentTheme } from '@constants/constant';
	import { onMount } from 'svelte';

	export let windowWidth;

	function changeActiveLink(_activeElId) {
		let els = document.querySelectorAll('.navs .nav-item');

		els.forEach((element) => {
			element.classList.remove('active');
			if (element.id == _activeElId) {
				element.classList.add('active');
			}
		});
	}

	onMount(() => {
		let els = document.querySelectorAll('.navs .nav-item');

		els.forEach((element) => {
			element.classList.remove('active');
			if (element.querySelector(`a[href='${$page.url.pathname}']`)) {
				element.classList.add('active');
			}
		});
	});
</script>

<aside class="py-3 px-2">
	<div class="content">
		<div class="header px-3">
			<div class="d-flex justify-content-between align-items-center h-50">
				<div class="text-start">
					<h3 id="side-title" class="title m-0">Xess Booking</h3>
				</div>
				{#if windowWidth > 1024}
					<SidenavToggler
						theme={{ color: $currentTheme?.sidebar.color, bg: $currentTheme?.sidebar.bg }}
					/>
				{/if}
			</div>
			<div id="side-title-small" class="title-small text-start mt-2">
				<small>Randevu & Rezervasyon Paneli</small>
			</div>
		</div>

		<div class="navs">
			<ul>
				<li id="nav-home" class="nav-item active">
					<a
						href="/"
						on:click={(e) => {
							changeActiveLink(e.target.closest('.nav-item').id);
						}}><i class="bx bx-home-alt"></i><span>Anasayfa</span></a
					>
				</li>
				<li id="nav-reservations" class="nav-item">
					<a
						href="/reservations"
						on:click={(e) => {
							changeActiveLink(e.target.closest('.nav-item').id);
						}}><i class="bx bx-calendar-event"></i> <span>Rezervasyonlar</span></a
					>
				</li>
				<li class="nav-seperator">
					<div>Tanımlar</div>
				</li>
				<li id="nav-services" class="nav-item">
					<a
						href="/services"
						on:click={(e) => {
							changeActiveLink(e.target.closest('.nav-item').id);
						}}><i class="bx bx-alarm"></i><span>Hizmetler</span></a
					>
				</li>
				<li id="nav-units" class="nav-item">
					<a
						href="/units"
						on:click={(e) => {
							changeActiveLink(e.target.closest('.nav-item').id);
						}}><i class="bx bx-spreadsheet"></i><span>Birimler</span></a
					>
				</li>
				<li id="nav-departments" class="nav-item">
					<a
						href="/departments"
						on:click={(e) => {
							changeActiveLink(e.target.closest('.nav-item').id);
						}}><i class="bx bx-store"></i> <span>Departmanlar</span></a
					>
				</li>
				<li class="nav-seperator">
					<div>Firma</div>
				</li>
				<li id="nav-company" class="nav-item">
					<a
						href="/company"
						on:click={(e) => {
							changeActiveLink(e.target.closest('.nav-item').id);
						}}><i class="bx bx-buildings"></i> <span>Firma</span></a
					>
				</li>
			</ul>
		</div>
	</div>
</aside>

<style>
	aside {
		width: 100%;
		height: 100%;
		position: relative;
		background-image: url('/assets/img/bg/mountain.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	aside::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(245, 54, 92, 0.75);
		z-index: 1;
	}

	aside .content {
		position: relative;
		z-index: 2;
		color: white;
		text-align: center;
	}

	.header {
		height: 100px;
	}

	.navs ul {
		list-style: none;
		text-align: start;
		margin: 0;
		padding: 0;
	}

	.nav-item {
		padding: 0;
		padding-left: 1rem;
		margin-top: 5px;
		position: relative;
		width: 100%;
		height: 40px;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 100ms linear;
	}

	.nav-seperator {
		margin: 20px 0;
		color: rgba(255, 255, 255, 0.6);
		display: flex;
		align-items: center;
		gap: 0px;
	}

	.nav-seperator::before {
		content: '';
		width: 25px;
		transform: translateX(-10px);
		height: 2px;
		background-color: rgba(255, 255, 255, 0.6);
	}

	.nav-item a {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		gap: 15px;

		color: rgba(255, 255, 255, 1);
		font-weight: 400;
		text-decoration: none;
	}

	.nav-item i {
		font-size: 19px;
	}

	.nav-item:hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.nav-item.active {
		background-color: rgba(255, 255, 255, 0.7);
	}

	.nav-item.active a {
		color: rgba(245, 54, 92, 1);
	}
</style>
