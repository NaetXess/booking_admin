<script>
	import { onMount } from 'svelte';
	import '@styles/css/bxicons/css/boxicons.min.css';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

{@render children?.()}
