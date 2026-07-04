// 1. Rol tanımları (Veritabanındaki type karşılıkları)
export const ROLES = Object.freeze({
	ADMIN: 1,
	STAFF: 2
});

// 2. Rollerin detayları ve UI bilgileri
export const ROLE_DETAILS = Object.freeze({
	[ROLES.ADMIN]: {
		title: 'Admin',
		desc: 'Sistemdeki her şeye tam erişim sağlar.',
		theme: 'purple'
	},
	[ROLES.STAFF]: {
		title: 'Personel',
		desc: 'Sadece randevuları görebilir ve yönetebilir.',
		theme: 'orange'
	}
});

// 3. YARDIMCI FONKSİYONLAR (Hayat Kurtaranlar)

/**
 * Güvenli veri çekme fonksiyonu (Geçersiz bir ID gelirse çökmesini önler)
 * @param {number} roleId
 */
export function getRoleDetails(roleId) {
	return (
		ROLE_DETAILS[roleId] || {
			title: 'Bilinmeyen',
			desc: 'Tanımsız rol yetkisi.',
			theme: 'gray'
		}
	);
}

/**
 * Rolleri Select / Dropdown menülerinde dönebilmek için Dizi (Array) hali
 */
export const ROLES_LIST = Object.entries(ROLE_DETAILS).map(([id, details]) => ({
	id: Number(id),
	...details
}));
