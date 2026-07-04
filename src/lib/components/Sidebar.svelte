<script>
	import { run } from 'svelte/legacy';

	import { page } from '$app/stores';
	import SidenavToggler from '@components/template/SidenavToggler.svelte';
	import { currentTheme } from '@constants/constant';
	import { onMount } from 'svelte';
	import { hasPermission } from '@functions/user_permissions';
	import { ROLES } from '@constants/roles';

	/** @type {{windowWidth: any}} */
	let { windowWidth } = $props();

	function detectActiveEl(params) {
		let els = document.querySelectorAll('.navs .nav-item');

		els.forEach((element) => {
			element.classList.remove('active');

			// Elementin içindeki a etiketini (linki) bul
			const link = element.querySelector('a');

			if (link) {
				const href = link.getAttribute('href'); // Örn: "/reservations" veya "/"

				// 1. Kural: Eğer link Anasayfa ("/") ise sadece birebir eşleşmede aktif et
				// (Aksi halde tüm linkler "/" ile başladığı için Anasayfa hep aktif kalır)
				if (href === '/' && $page.url.pathname === '/') {
					element.classList.add('active');
				}
				// 2. Kural: Eğer link "/" değilse ve mevcut sayfa bu link ile "BAŞLIYORSA" aktif et
				else if (href !== '/' && $page.url.pathname.startsWith(href)) {
					element.classList.add('active');
				}
			}
		});
	}

	const menuItems = [
		{ type: 'link', name: 'Anasayfa', href: '/', icon: 'bx-home-alt' },
		{ type: 'link', name: 'Randevular', href: '/reservations', icon: 'bx-calendar-event' },
		{ type: 'link', name: 'Randevu Planları', href: '/reservation-plans', icon: 'bx-sync' },
		{ type: 'link', name: 'Müşteriler', href: '/customers', icon: 'bx-user-pin' },
		{ type: 'link', name: 'Finans', href: '/finance', icon: 'bx-wallet', roles: [ROLES.ADMIN] }, // Admin
		{ type: 'separator', name: 'Tanımlar', roles: [ROLES.ADMIN] },
		{
			type: 'link',
			name: 'Kaynaklar',
			href: '/units',
			icon: 'bx-spreadsheet',
			roles: [ROLES.ADMIN]
		},
		{ type: 'link', name: 'Hizmetler', href: '/services', icon: 'bx-alarm', roles: [ROLES.ADMIN] },
		{
			type: 'link',
			name: 'Departmanlar',
			href: '/departments',
			icon: 'bx-store',
			roles: [ROLES.ADMIN]
		},
		{ type: 'separator', name: 'Firma & Panel', roles: [ROLES.ADMIN] },
		{ type: 'link', name: 'Kullanıcılar', href: '/users', icon: 'bx-user', roles: [ROLES.ADMIN] },
		{ type: 'link', name: 'Firma', href: '/company', icon: 'bx-buildings', roles: [ROLES.ADMIN] }
	];

	onMount(() => {
		detectActiveEl();
	});
	run(() => {
		$page.url.pathname, detectActiveEl();
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
				{#each menuItems as item}
					{#if hasPermission(item)}
						{#if item.type === 'link'}
							<li class="nav-item">
								<a href={item.href}>
									<i class="bx {item.icon}"></i>
									<span>{item.name}</span>
								</a>
							</li>
						{:else if item.type === 'separator'}
							<li class="nav-seperator">
								<div>{item.name}</div>
							</li>
						{/if}
					{/if}
				{/each}
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
