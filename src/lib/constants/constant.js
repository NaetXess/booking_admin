import { writable } from 'svelte/store';

export const currentTheme = writable({});
export const sidebarCollapsed = writable(false);
export const windowWidth = writable(0);

export const sourceLabelMap = {
	0: 'Bilinmeyen',
	1: 'Uygulama',
	2: 'Admin',
	3: 'Postman'
};

export function sourceLabel(src) {
	return sourceLabelMap[src] ?? 'Bilinmiyor';
}
