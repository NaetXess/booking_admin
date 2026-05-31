export function getRecurrenceText(recurrenceType, recurrenceEvery, recurrenceDays) {
	const daysMap = {
		1: 'pazartesi',
		2: 'salı',
		3: 'çarşamba',
		4: 'perşembe',
		5: 'cuma',
		6: 'cumartesi',
		7: 'pazar'
	};

	const type = parseInt(recurrenceType);
	const every = parseInt(recurrenceEvery) || 1;
	let daysStr = '';

	// Özel durum kontrolleri için bayraklar
	let isWeekdays = false;
	let isWeekends = false;
	let isAllDays = false;

	if (type === 2 && Array.isArray(recurrenceDays) && recurrenceDays.length > 0) {
		const sortedDays = [...new Set(recurrenceDays)].sort((a, b) => a - b);

		// 7 günün hepsi seçilmişse
		isAllDays = sortedDays.length === 7;
		// Tam olarak 1'den 5'e kadar (Pzt-Cuma) 5 gün seçilmişse
		isWeekdays = sortedDays.length === 5 && sortedDays.every((d) => d >= 1 && d <= 5);
		// Tam olarak 6 ve 7 (Cmt-Pzr) 2 gün seçilmişse
		isWeekends = sortedDays.length === 2 && sortedDays.includes(6) && sortedDays.includes(7);

		if (isAllDays) {
			daysStr = 'her gün';
		} else if (isWeekdays) {
			daysStr = 'hafta içi her gün';
		} else if (isWeekends) {
			daysStr = 'hafta sonu her gün';
		} else {
			// Hiçbir gruba uymayan karışık gün seçimleri (Örn: Salı, Perşembe)
			const dayNames = sortedDays.map((d) => daysMap[d]);
			if (dayNames.length === 1) {
				daysStr = dayNames[0];
			} else if (dayNames.length === 2) {
				daysStr = dayNames.join(' ve ');
			} else {
				const lastDay = dayNames.pop();
				daysStr = dayNames.join(', ') + ' ve ' + lastDay;
			}
		}
	}

	switch (type) {
		case 1: // Günlük
			return every === 1 ? 'Her gün' : `${every} günde bir`;

		case 2: // Haftalık
			if (every === 1) {
				if (isAllDays || isWeekdays || isWeekends) {
					// İlk harfi büyüt (Örn: "Hafta içi her gün")
					return daysStr.charAt(0).toUpperCase() + daysStr.slice(1);
				}
				return daysStr ? `Her ${daysStr}` : 'Her hafta';
			} else {
				// (Örn: "2 haftada bir hafta içi her gün" veya "2 haftada bir pazartesi")
				return daysStr ? `${every} haftada bir ${daysStr}` : `${every} haftada bir`;
			}

		case 3: // Aylık
			return every === 1 ? 'Her ay' : `${every} ayda bir`;

		default:
			return '';
	}
}
