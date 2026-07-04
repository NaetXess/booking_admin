<script>
	/** @type {import('./$types').LayoutData} */
	import { onMount } from 'svelte';
	import '@styles/scss/app.scss';
	import '@styles/css/global.css';
	import '@styles/scss/themes/light.scss';
	import '@styles/css/bxicons/css/boxicons.min.css';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();

	onMount(async () => {
		const bootstrap = await import('bootstrap');
	});
</script>

{@render children?.()}

<style>
</style>
