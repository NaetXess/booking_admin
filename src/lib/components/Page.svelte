<script>
	import SidenavToggler from '@components/template/SidenavToggler.svelte';
	import { windowWidth } from '@constants/constant';
	import { goto } from '$app/navigation';
	import { hasPermission } from '@functions/user_permissions';
	import { ROLES, getRoleDetails } from '@constants/roles';
	import { getUserData } from '@functions/localestorage';
	import { onMount } from 'svelte';

	/** @type {{id: any, cls: any, children?: import('svelte').Snippet}} */
	let { id, cls, children } = $props();

	// ─── Arama ───────────────────────────────────────────
	const quickActions = [
		{ label: 'Yeni', name: 'Randevu', href: '/reservations/create/new', icon: 'bx-calendar-plus' },
		{ label: 'Yeni', name: 'Müşteri', href: '/customers#create', icon: 'bx-user-plus' },
		{
			label: 'Yeni',
			name: 'Departman',
			href: '/departments/create/new',
			icon: 'bx-store',
			roles: [ROLES.ADMIN]
		}
	];

	const pages = [
		{ name: 'Anasayfa', href: '/', icon: 'bx-home-alt' },
		{ name: 'Randevular', href: '/reservations', icon: 'bx-calendar-event' },
		{ name: 'Randevu Planları', href: '/reservation-plans', icon: 'bx-sync' },
		{ name: 'Müşteriler', href: '/customers', icon: 'bx-user-pin' },
		{ name: 'Finans', href: '/finance', icon: 'bx-wallet', roles: [ROLES.ADMIN] },
		{ name: 'Kaynaklar', href: '/units', icon: 'bx-spreadsheet', roles: [ROLES.ADMIN] },
		{ name: 'Hizmetler', href: '/services', icon: 'bx-alarm', roles: [ROLES.ADMIN] },
		{ name: 'Departmanlar', href: '/departments', icon: 'bx-store', roles: [ROLES.ADMIN] },
		{ name: 'Kullanıcılar', href: '/users', icon: 'bx-user', roles: [ROLES.ADMIN] },
		{ name: 'Firma', href: '/company', icon: 'bx-buildings', roles: [ROLES.ADMIN] }
	];

	let searchText = $state('');
	let isFocused = $state(false);
	let userData = $state({});

	let filteredActions = $derived(
		searchText.trim() === ''
			? quickActions
			: quickActions.filter((a) =>
					(a.label + ' ' + a.name).toLowerCase().includes(searchText.toLowerCase())
				)
	);

	let filteredPages = $derived(
		searchText.trim() === ''
			? pages.slice(0, 3)
			: pages.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()))
	);

	function handleSelect(href) {
		goto(href);
		searchText = '';
		isFocused = false;
	}

	function handleSearchBlur() {
		setTimeout(() => {
			isFocused = false;
		}, 150);
	}

	// ─── Bildirimler ─────────────────────────────────────
	let notifOpen = $state(false);

	const notifications = [
		{
			id: 1,
			icon: 'bx-calendar-check',
			iconColor: '#22c55e',
			iconBg: 'rgba(34,197,94,0.1)',
			title: 'Yeni Randevu Oluşturuldu',
			desc: 'Mustafa Erdem Arslan — Saç Tıraşı — Bugün 10:00',
			time: '5 dakika önce',
			unread: true
		},
		{
			id: 2,
			icon: 'bx-x-circle',
			iconColor: '#f5365c',
			iconBg: 'rgba(245,54,92,0.1)',
			title: 'Randevu İptal Edildi',
			desc: 'Ahmet Yılmaz — Sakal Düzeltme — Yarın 14:30',
			time: '1 saat önce',
			unread: true
		}
	];

	let unreadCount = $derived(notifications.filter((n) => n.unread).length);

	function toggleNotif() {
		notifOpen = !notifOpen;
		if (accountOpen) accountOpen = false;
	}

	function handleNotifBlur() {
		setTimeout(() => {
			notifOpen = false;
		}, 150);
	}

	// ─── Hesap ────────────────────────────────────────────
	let accountOpen = $state(false);

	const accountMenuItems = [
		{ icon: 'bx-user', label: 'Profilim', href: '/user-profile' },
		{ icon: 'bx-buildings', label: 'Firma Ayarları', href: '/company' },
		{ icon: 'bx-cog', label: 'Panel Ayarları', href: '/settings' },
		{ divider: true },
		{ icon: 'bx-log-out', label: 'Çıkış Yap', href: '/login', danger: true }
	];

	function toggleAccount() {
		accountOpen = !accountOpen;
		if (notifOpen) notifOpen = false;
	}

	function handleAccountBlur() {
		setTimeout(() => {
			accountOpen = false;
		}, 150);
	}

	onMount(() => {
		userData = getUserData();
	});
</script>

<div {id} class="container-fluid p-0 {cls}">
	<nav class="px-5 py-3">
		<!-- ─── Arama Barı ──────────────────────────────── -->
		<div style="position: relative;">
			<div id="search-bar" class={isFocused ? 'focused' : ''}>
				<div class="icon-wrapper">
					<i class="bx bx-search-alt"></i>
				</div>
				<div class="input-wrapper">
					<input
						type="text"
						placeholder="Ara"
						bind:value={searchText}
						onfocus={() => (isFocused = true)}
						onblur={handleSearchBlur}
					/>
				</div>
			</div>

			{#if isFocused}
				<div id="search-dropdown">
					{#if filteredActions.length > 0}
						<div class="dropdown-group-label">Hızlı İşlemler</div>
						{#each filteredActions as action}
							{#if hasPermission(action)}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="search-item" onclick={() => handleSelect(action.href)}>
									<i class="bx {action.icon}"></i>
									<span><span class="badge-new">{action.label}</span>{action.name}</span>
								</div>
							{/if}
						{/each}
					{/if}

					{#if filteredPages.length > 0}
						<div class="dropdown-group-label" style="margin-top:6px">
							{searchText.trim() === '' ? 'Öne Çıkanlar' : 'Sayfalar'}
						</div>
						{#each filteredPages as page}
							{#if hasPermission(page)}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="search-item" onclick={() => handleSelect(page.href)}>
									<i class="bx {page.icon}"></i>
									<span>{page.name}</span>
								</div>
							{/if}
						{/each}
					{/if}

					{#if filteredActions.length === 0 && filteredPages.length === 0}
						<div class="search-empty">Eşleşen sonuç bulunamadı.</div>
					{/if}

					{#if searchText.trim() === ''}
						<div class="dropdown-hint">Daha fazlası için yazmaya başlayın...</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- ─── Sağ Aksiyonlar ──────────────────────────── -->
		<div class="nav-actions">
			{#if $windowWidth < 1024}
				<div id="sidebar-collapse">
					<SidenavToggler />
				</div>
			{/if}

			<!-- Bildirim Butonu -->
			<div class="nav-btn-wrapper d-none" style="position:relative; ">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="nav-icon-btn {notifOpen ? 'active' : ''}"
					onclick={toggleNotif}
					onblur={handleNotifBlur}
					tabindex="0"
				>
					<i class="bx bxs-bell"></i>
					{#if unreadCount > 0}
						<span class="notif-badge">{unreadCount}</span>
					{/if}
				</div>

				{#if notifOpen}
					<div class="popup-dropdown notif-dropdown">
						<div class="popup-header">
							<span class="popup-title">Bildirimler</span>
							{#if unreadCount > 0}
								<span class="popup-badge">{unreadCount} yeni</span>
							{/if}
						</div>

						<div class="notif-list">
							{#each notifications as notif}
								<div class="notif-item {notif.unread ? 'unread' : ''}">
									<div class="notif-icon-wrap" style="background:{notif.iconBg}">
										<i class="bx {notif.icon}" style="color:{notif.iconColor}"></i>
									</div>
									<div class="notif-body">
										<div class="notif-title">{notif.title}</div>
										<div class="notif-desc">{notif.desc}</div>
										<div class="notif-time">
											<i class="bx bx-time-five"></i>
											{notif.time}
										</div>
									</div>
									{#if notif.unread}
										<div class="notif-dot"></div>
									{/if}
								</div>
							{/each}
						</div>

						<div class="popup-footer">
							<a href="/notifications" onclick={() => (notifOpen = false)}>
								Tüm bildirimleri gör
								<i class="bx bx-right-arrow-alt"></i>
							</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- Hesap Butonu -->
			<div class="nav-btn-wrapper" style="position:relative;">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="nav-account-btn {accountOpen ? 'active' : ''}"
					onclick={toggleAccount}
					onblur={handleAccountBlur}
					tabindex="0"
				>
					<div class="account-avatar">A</div>
					<div class="account-info">
						<span class="account-name">{userData?.username}</span>
						<span class="account-role">{getRoleDetails(userData?.type)?.title}</span>
					</div>
					<i class="bx bx-chevron-down account-chevron {accountOpen ? 'rotated' : ''}"></i>
				</div>

				{#if accountOpen}
					<div class="popup-dropdown account-dropdown">
						<!-- Profil Özeti -->
						<div class="account-popup-header">
							<div class="account-avatar-lg">A</div>
							<div>
								<div class="account-popup-name">{userData?.name}</div>
								<div class="account-popup-mail">{userData?.mail}</div>
							</div>
						</div>

						<div class="account-menu">
							{#each accountMenuItems as item}
								{#if item.divider}
									<div class="account-divider"></div>
								{:else}
									<a
										href={item.href}
										class="account-menu-item {item.danger ? 'danger' : ''}"
										onclick={() => (accountOpen = false)}
									>
										<i class="bx {item.icon}"></i>
										<span>{item.label}</span>
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</nav>
	<hr class="m-0" />
	<div class="content px-5 py-3">
		{@render children?.()}
	</div>
</div>

<style>
	.content {
		overflow: hidden;
		height: calc(100vh - 71px);
		overflow: auto;
	}

	nav {
		height: 70px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	hr {
		color: rgba(150, 150, 150, 0.5);
	}

	/* ─── Search Bar ──────────────────────────── */
	#search-bar {
		border-radius: 50px;
		display: flex;
		background-color: #445471;
		height: 40px;
		overflow: hidden;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
		transition: box-shadow 150ms ease;
	}
	#search-bar.focused {
		box-shadow: 0 0 0 3px rgba(245, 54, 92, 0.4);
	}
	#search-bar .icon-wrapper {
		width: 40px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#search-bar .icon-wrapper i {
		color: white;
		font-size: 21px;
	}
	#search-bar .input-wrapper input {
		border: none;
		outline: none;
		color: white;
		background-color: transparent;
		height: 100%;
		min-width: 140px;
		font-size: 13px;
	}
	#search-bar .input-wrapper input::placeholder {
		color: rgba(255, 255, 255, 0.7);
	}

	/* ─── Search Dropdown ─────────────────────── */
	#search-dropdown {
		position: absolute;
		top: calc(100% + 10px);
		left: 0;
		min-width: 260px;
		background: white;
		border-radius: 14px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.14);
		border: 1px solid rgba(0, 0, 0, 0.06);
		z-index: 999;
		padding: 8px;
	}
	.dropdown-group-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #b0b8c4;
		padding: 4px 10px;
		margin-bottom: 2px;
	}
	.search-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
		color: #445471;
		transition: background-color 120ms ease;
	}
	.search-item:hover {
		background-color: rgba(245, 54, 92, 0.07);
	}
	.search-item i {
		font-size: 17px;
		color: #b0b8c4;
		flex-shrink: 0;
	}
	.search-item:hover i {
		color: #f5365c;
	}
	.badge-new {
		display: inline-block;
		background-color: rgba(245, 54, 92, 0.12);
		color: #f5365c;
		font-size: 11px;
		font-weight: 700;
		padding: 1px 6px;
		border-radius: 4px;
		margin-right: 4px;
	}
	.search-empty {
		padding: 14px;
		text-align: center;
		font-size: 13px;
		color: #b0b8c4;
	}
	.dropdown-hint {
		border-top: 1px solid #f0f2f5;
		margin-top: 6px;
		padding: 7px 12px 2px;
		font-size: 11px;
		color: #c0c8d4;
		text-align: center;
	}

	/* ─── Nav Actions (Sağ Grup) ──────────────── */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.nav-btn-wrapper {
		position: relative;
	}

	/* ─── Bildirim Butonu ─────────────────────── */
	.nav-icon-btn {
		position: relative;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background-color 120ms ease;
		background-color: #f7f8fa;
		border: 1.5px solid #ebedf0;
		outline: none;
	}
	.nav-icon-btn:hover,
	.nav-icon-btn.active {
		background-color: rgba(245, 54, 92, 0.07);
		border-color: rgba(245, 54, 92, 0.3);
	}
	.nav-icon-btn i {
		font-size: 20px;
		color: #445471;
	}
	.nav-icon-btn.active i {
		color: #f5365c;
	}
	.notif-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #f5365c;
		color: white;
		font-size: 10px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid white;
	}

	/* ─── Hesap Butonu ────────────────────────── */
	.nav-account-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 10px 6px 6px;
		border-radius: 12px;
		cursor: pointer;
		transition: background-color 120ms ease;
		background-color: #f7f8fa;
		border: 1.5px solid #ebedf0;
		outline: none;
	}
	.nav-account-btn:hover,
	.nav-account-btn.active {
		background-color: rgba(245, 54, 92, 0.07);
		border-color: rgba(245, 54, 92, 0.3);
	}
	.account-avatar {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: linear-gradient(135deg, #f5365c, #c9154a);
		color: white;
		font-size: 13px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.account-info {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}
	.account-name {
		font-size: 13px;
		font-weight: 600;
		color: #445471;
	}
	.account-role {
		font-size: 10px;
		color: #9aa3b0;
	}
	.account-chevron {
		font-size: 16px;
		color: #9aa3b0;
		transition: transform 200ms ease;
	}
	.account-chevron.rotated {
		transform: rotate(180deg);
	}

	/* ─── Popup Dropdown (Ortak) ──────────────── */
	.popup-dropdown {
		position: absolute;
		top: calc(100% + 10px);
		right: 0;
		background: white;
		border-radius: 16px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
		border: 1px solid rgba(0, 0, 0, 0.06);
		z-index: 999;
		overflow: hidden;
	}
	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px 10px;
		border-bottom: 1px solid #f0f2f5;
	}
	.popup-title {
		font-size: 14px;
		font-weight: 700;
		color: #2d3a52;
	}
	.popup-badge {
		font-size: 11px;
		font-weight: 600;
		color: #f5365c;
		background: rgba(245, 54, 92, 0.1);
		padding: 2px 8px;
		border-radius: 20px;
	}
	.popup-footer {
		padding: 10px 16px;
		border-top: 1px solid #f0f2f5;
		display: flex;
		justify-content: center;
	}
	.popup-footer a {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #f5365c;
		text-decoration: none;
		font-weight: 600;
	}
	.popup-footer a:hover {
		opacity: 0.8;
	}

	/* ─── Bildirim Dropdown ───────────────────── */
	.notif-dropdown {
		width: 340px;
	}
	.notif-list {
		padding: 8px;
		max-height: 280px;
		overflow-y: auto;
	}
	.notif-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 10px;
		border-radius: 10px;
		cursor: pointer;
		transition: background-color 100ms ease;
		position: relative;
	}
	.notif-item:hover {
		background-color: #f7f8fa;
	}
	.notif-item.unread {
		background-color: rgba(245, 54, 92, 0.035);
	}
	.notif-item.unread:hover {
		background-color: rgba(245, 54, 92, 0.07);
	}
	.notif-icon-wrap {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.notif-icon-wrap i {
		font-size: 19px;
	}
	.notif-body {
		flex: 1;
		min-width: 0;
	}
	.notif-title {
		font-size: 13px;
		font-weight: 600;
		color: #2d3a52;
		margin-bottom: 2px;
	}
	.notif-desc {
		font-size: 12px;
		color: #7a8699;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.notif-time {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 11px;
		color: #b0b8c4;
		margin-top: 4px;
	}
	.notif-time i {
		font-size: 12px;
	}
	.notif-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f5365c;
		flex-shrink: 0;
		margin-top: 4px;
	}

	/* ─── Hesap Dropdown ──────────────────────── */
	.account-dropdown {
		width: 240px;
	}
	.account-popup-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: linear-gradient(135deg, #f5365c08, #ffffff);
		border-bottom: 1px solid #f0f2f5;
	}
	.account-avatar-lg {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		background: linear-gradient(135deg, #f5365c, #c9154a);
		color: white;
		font-size: 18px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.account-popup-name {
		font-size: 14px;
		font-weight: 700;
		color: #2d3a52;
	}
	.account-popup-mail {
		font-size: 11px;
		color: #9aa3b0;
		margin-top: 1px;
	}
	.account-menu {
		padding: 8px;
	}
	.account-menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
		color: #445471;
		text-decoration: none;
		transition: background-color 100ms ease;
	}
	.account-menu-item:hover {
		background-color: #f7f8fa;
		color: #445471;
	}
	.account-menu-item.danger {
		color: #f5365c;
	}
	.account-menu-item.danger:hover {
		background-color: rgba(245, 54, 92, 0.07);
	}
	.account-menu-item i {
		font-size: 17px;
		color: #b0b8c4;
	}
	.account-menu-item.danger i {
		color: #f5365c;
	}
	.account-divider {
		height: 1px;
		background: #f0f2f5;
		margin: 6px 0;
	}
</style>
