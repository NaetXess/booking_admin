import { writable } from 'svelte/store';

export const currentTheme = writable({});
export const sidebarCollapsed = writable(false);
export const windowWidth = writable(0);
