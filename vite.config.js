import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@components': fileURLToPath(new URL('./src/lib/components', import.meta.url)),
			'@config': fileURLToPath(new URL('./src/lib/config/config.js', import.meta.url)),
			'@styles': fileURLToPath(new URL('./src/lib/styles', import.meta.url)),
			'@functions': fileURLToPath(new URL('./src/lib/functions', import.meta.url)),
			'@constants': fileURLToPath(new URL('./src/lib/constants', import.meta.url)),
			'@stores': fileURLToPath(new URL('./src/lib/stores', import.meta.url)),
			'@constants': fileURLToPath(new URL('./src/lib/constants', import.meta.url)),
			'@controllers': fileURLToPath(new URL('./src/lib/controllers', import.meta.url)),
			'@utils': fileURLToPath(new URL('./src/lib/utils', import.meta.url)),
			'@src': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server: {
		port: 5005,
		host: true
	}
});
