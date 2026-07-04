<script>
	import { run, preventDefault, stopPropagation } from 'svelte/legacy';

	import { formatPhoneDisplay } from '@utils/function';
	import { onMount } from 'svelte';
	import countries from '@constants/country_codes.json';

	// Dışarıdan veya DB'den gelecek değişkenleriniz

	/** @type {{phoneValue?: string, countryCode?: string, format?: string, id: any, disabled: any, autoFilled: any}} */
	let {
		phoneValue = $bindable(''),
		countryCode = $bindable('+90'),
		format = 'input',
		id,
		disabled,
		autoFilled
	} = $props();

	// Component içi state'ler
	let displayValue = $state('');
	let isOpen = $state(false);
	let searchQuery = $state('');
	let dropdownContainer = $state(); // Dışarı tıklamayı yakalamak için wrapper referansı
	let searchInputRef = $state(); // Dropdown açılınca otomatik focuslanmak için

	// İsime veya ülke koduna göre filtreleme (Büyük/Küçük harf duyarsız)
	let filteredCountries = $derived(countries.filter(
		(c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.dial_code.includes(searchQuery)
	));

	// Dışarıdan telefon geldikçe formatla
	run(() => {
		if (phoneValue !== undefined && phoneValue !== null) {
			displayValue = formatPhoneDisplay(countryCode, phoneValue, format);
		}
	});

	// Modal dışına tıklanıldığında kapatma event listener'ı
	onMount(() => {
		const handleOutsideClick = (e) => {
			if (isOpen && dropdownContainer && !dropdownContainer.contains(e.target)) {
				isOpen = false;
			}
		};
		window.addEventListener('click', handleOutsideClick);
		return () => window.removeEventListener('click', handleOutsideClick);
	});

	// Menüyü Aç/Kapat
	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			searchQuery = ''; // Her açılışta aramayı sıfırla
			// Menü render olduktan hemen sonra inputa odaklan:
			setTimeout(() => {
				if (searchInputRef) searchInputRef.focus();
			}, 50);
		}
	}

	// Ülke seçildiğinde tetiklenir
	function selectCountry(code) {
		countryCode = code;
		isOpen = false;
	}

	// Numarayı formata çevirirken boşluksuz gerçek numarayı kaydeder (Önceki fonksiyonumuz)
	function handleInput(event) {
		let inputStr = event.target.value;
		let raw = inputStr.replace(/\D/g, '');
		if (countryCode === '+90') {
			if (raw.startsWith('0')) raw = raw.substring(1); // baştaki 0'ı at
			raw = raw.substring(0, 10); // TR için MAKSİMUM 10 hane
			phoneValue = raw;
			displayValue = formatPhoneDisplay(countryCode, phoneValue, format);
		}
		// EĞER YABANCI BİR ÜLKE İSE: (Sadece rakam girmesine izin ver)
		else {
			raw = raw.substring(0, 15); // Dünya standardı MAKSİMUM 15 hane
			phoneValue = raw;
			// Yabancı numara için boşluklu düz görünüm (Her 3 rakamda bir boşluk koyalım ki okunması kolay olsun)
			displayValue = raw.replace(/(\d{3})(?=\d)/g, '$1 ');
		}
	}
</script>

<div class="phone-input-wrapper" bind:this={dropdownContainer}>
	<!-- Ana Input Alanı -->
	<div class="input-container {autoFilled ? 'auto-fill' : ''}" class:focused={isOpen}>
		<!-- Ülke Seçici Buton -->
		<button
			type="button"
			class="country-selector"
			{disabled}
			onclick={stopPropagation(preventDefault(toggleDropdown))}
		>
			<span class="code-text">{countryCode}</span>
			<svg
				class="chevron"
				class:open={isOpen}
				width="16"
				height="16"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					d="M6 9L12 15L18 9"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<!-- Telefon Input -->
		<input
			{id}
			{disabled}
			class="phone-input-field"
			type="text"
			placeholder="5XX XXX XX XX"
			value={displayValue}
			oninput={handleInput}
		/>
	</div>

	<!-- Özel Ülke Seçim Menüsü (Açılır Kapanır) -->
	{#if isOpen}
		<div class="custom-country-menu">
			<div class="search-box">
				<input
					type="text"
					placeholder="Ülke kodu veya isim ara..."
					bind:value={searchQuery}
					bind:this={searchInputRef}
				/>
			</div>

			<ul class="country-list">
				{#each filteredCountries as item}
					<!-- svelte-ignore a11y_click_events_have_key_events // (Svelte uyarılarını susturmak için opsiyonel) -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						class="country-item"
						class:active={item.dial_code === countryCode}
						onclick={() => selectCountry(item.dial_code)}
					>
						<span class="country-name">{item.name}</span>
						<span class="country-dial">{item.dial_code}</span>
					</li>
				{:else}
					<li class="empty-state">Sonuç bulunamadı</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	/* Taşıyıcı ve Font */
	.phone-input-wrapper {
		position: relative;
		width: 100%;
		font-family: inherit;
	}

	/* Ana Kutu Tasarımı */
	.input-container {
		display: flex;
		align-items: center;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		background: #fff;
		transition: all 0.2s ease;
	}

	/* Inputa Fokuslanınca veya Dropdown Açılınca (Admin Temanızla Uyumu #f5365c) */
	.input-container:focus-within,
	.input-container.focused {
		border-color: #f5365c;
		box-shadow: 0 0 0 3px rgba(245, 54, 92, 0.15);
	}

	/* Ülke Butonu */
	.country-selector {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0.75rem 1rem;
		background: #f8fafc;
		border: none;
		border-right: 1px solid #e2e8f0;
		border-radius: 8px 0 0 8px;
		cursor: pointer;
		color: #334155;
		font-weight: 500;
		transition: background 0.2s;
		height: 100%;
	}

	.country-selector:not(:disabled):hover {
		background: #f1f5f9;
		color: #f5365c;
	}

	.code-text {
		font-size: 0.9rem;
	}

	/* Ok İkonu Animasyonu */
	.chevron {
		transition: transform 0.2s ease;
		color: #64748b;
	}
	.chevron.open {
		transform: rotate(180deg);
	}

	/* Numara Inputu */
	.phone-input-field {
		flex: 1;
		padding: 0.75rem 1rem;
		border: none;
		outline: none;
		font-size: 0.95rem;
		color: #334155;
		border-radius: 0 8px 8px 0;
		width: 100%;
		box-sizing: border-box;
	}
	.phone-input-field::placeholder {
		color: #cbd5e1;
	}

	/* Dropdown Menü Arayüzü */
	.custom-country-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		width: 100%; /* Veya isterseniz min-width: 280px; verebilirsiniz */
		background: #fff;
		border-radius: 8px;
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.1),
			0 8px 10px -6px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		z-index: 50;
		overflow: hidden;
	}

	/* Arama Kutusu */
	.search-box {
		padding: 10px;
		border-bottom: 1px solid #eee;
		background: #fdfdfd;
	}

	.search-box input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		outline: none;
		font-size: 0.85rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.search-box input:focus {
		border-color: #f5365c;
	}

	/* Liste Alanı ve Scroll */
	.country-list {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 220px;
		overflow-y: auto;
	}

	.country-list::-webkit-scrollbar {
		width: 6px;
	}
	.country-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.country-list::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 10px;
	}

	/* Liste İçindeki Ülkeler */
	.country-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: background 0.15s;
		font-size: 0.85rem;
	}

	.country-item:hover {
		background: #f8fafc;
	}

	/* Seçili Ülke Efekti */
	.country-item.active {
		background: rgba(245, 54, 92, 0.05); /* Proje pembenizin %5 şeffaf hali */
		border-left: 3px solid #f5365c; /* Opsiyonel şık bir detay */
		padding-left: calc(1rem - 3px); /* Kaymasını engeller */
	}

	.country-name {
		color: #475569;
		font-weight: 500;
	}
	.country-item.active .country-name {
		color: #f5365c;
	}

	.country-dial {
		color: #64748b;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.empty-state {
		padding: 1rem;
		text-align: center;
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.input-container.auto-fill {
		background-color: rgba(
			244,
			100,
			129,
			0.03
		); /* Yok denecek kadar az, çok transparan bir tema rengi */
		border: 1px solid rgba(244, 100, 129, 0.3); /* Çok hafif tema rengi çerçeve */
		color: #4b5563; /* Yazı rengi koyu, okunabilir */

		/* İkon eklemek için (Opsiyonel) */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f46481' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'%3E%3C/path%3E%3Cpolyline points='22 4 12 14.01 9 11.01'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		background-size: 16px;
		padding-right: 36px; /* İkon yazının üstüne binmesin diye */
	}
</style>
