export const RESERVATION_STATUS = Object.freeze({
	PENDING: 0, // Bekliyor    — onay bekleniyor
	CONFIRMED: 1, // Onaylandı   — aktif rezervasyon
	COMPLETED: 2, // Tamamlandı  — hizmet verildi
	CANCELLED: 3, // İptal       — iptal edildi
	NOSHOW: 4 // müşteri gelmedi
});

// 2. Rollerin detayları ve UI bilgileri
export const RESERVATION_STATUS_DETAILS = Object.freeze({
	[RESERVATION_STATUS.PENDING]: {
		title: 'Bekliyor',
		theme: 'orange'
	},
	[RESERVATION_STATUS.CONFIRMED]: {
		title: 'Aktif',
		theme: 'primary'
	},
	[RESERVATION_STATUS.COMPLETED]: {
		title: 'Tamamlandı',
		theme: 'green'
	},
	[RESERVATION_STATUS.CANCELLED]: {
		title: 'İptal',
		theme: 'danger'
	},
	[RESERVATION_STATUS.NOSHOW]: {
		title: 'Müşteri Gelmedi',
		theme: 'danger'
	},
	[-1]: {
		title: 'Bilinmeyen/Hata',
		theme: 'grey'
	}
});
