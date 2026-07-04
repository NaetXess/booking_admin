<script>
	import { run } from 'svelte/legacy';

	import { formatPhoneDisplay } from '@utils/function';
	// Dışarıya veya DB'ye gidecek olan SAF numara (örn: "5551234567")
	/** @type {{value?: string}} */
	let { value = $bindable('') } = $props();

	// Kullanıcının inputta göreceği FORMATLI numara (örn: "555 123 45 67")
	let displayValue = $state('');

	// Dışarıdan value dolduğunda (örn: veritabanından veri çekildiğinde) ekrana formatlı yansıt
	run(() => {
		if (value !== undefined) {
			displayValue = formatPhoneDisplay(value);
		}
	});

	// Kullanıcı klavyeden bir şey yazdığında çalışacak fonksiyon
	function handleInput(event) {
		let inputStr = event.target.value;

		// 1. Sadece rakamları ayıkla (harf ve boşlukları sil)
		let raw = inputStr.replace(/\D/g, '');

		// 2. Kullanıcı alışkanlıkla başa 0 yazarsa onu at
		if (raw.startsWith('0')) {
			raw = raw.substring(1);
		}

		// 3. Maksimum 10 karakter olmasını sağla
		raw = raw.substring(0, 10);

		// 4. Saf değişkeni güncelle (DB'ye gidecek olan bu)
		value = raw;

		// 5. Ekranda görünen inputtaki yazıyı anında formatla
		displayValue = formatPhoneDisplay(raw);
	}
</script>

<!-- UI Kısmı -->
<div class="input-container">
	<span class="country-code">+90</span>
	<input type="text" placeholder="5XX XXX XX XX" value={displayValue} oninput={handleInput} />
</div>

<style>
	/* Tasarımın sizin panelinize uygun, temiz görünmesi için ufak bir CSS */
	.input-container {
		display: flex;
		align-items: center;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
		background: #fff;
		transition: border-color 0.2s;
	}

	.input-container:focus-within {
		border-color: #f5365c; /* Projenizin ana rengi */
		box-shadow: 0 0 0 2px rgba(245, 54, 92, 0.1);
	}

	.country-code {
		padding: 0.5rem 0.75rem;
		background: #f8fafc;
		color: #64748b;
		font-weight: 500;
		font-size: 0.875rem;
		border-right: 1px solid #e2e8f0;
		user-select: none;
	}

	input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: none;
		outline: none;
		font-size: 0.95rem;
		color: #334155;
	}

	input::placeholder {
		color: #cbd5e1;
	}
</style>
