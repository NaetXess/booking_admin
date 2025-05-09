<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { sidebarCollapsed } from '@constants/constant';
	import { handleResizeSidebar, handleSidebarCollapse } from '@functions/sidebar';

	const dispatch = createEventDispatcher();

	export let theme;

	onMount(() => {
		let wrapper = document.getElementById('wrapper');

		if (wrapper.classList.contains('sidebar-extended') && window.innerWidth > 1024) {
			sidebarCollapsed.set(false);
		} else {
			sidebarCollapsed.set(true);
		}

		// Tema Renkleri Ayarlama
		const root = document.documentElement;

		root.style.setProperty('--color', theme?.color ? theme.color : 'black');
		root.style.setProperty('--bg-color', theme?.bg ? theme?.bg : 'white');
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="d-flex sidenav-toggler"
	on:click={() => {
		window.innerWidth > 1024 ? handleResizeSidebar() : handleSidebarCollapse();

		dispatch('collapse', {
			collapsed: $sidebarCollapsed
		});
	}}
>
	<div id="toggler-first" class="toggler-line {$sidebarCollapsed ? '' : 'half'}"></div>
	<div id="toggler-second" class="toggler-line"></div>
	<div id="toggler-thirt" class="toggler-line {$sidebarCollapsed ? '' : 'half'}"></div>
</div>

<style>
	.sidenav-toggler {
		flex-direction: column;
		gap: 3px;
		cursor: pointer;
		position: relative;
	}

	.toggler-line {
		width: 18px;
		height: 2px;
		background-color: var(--color);
		border-radius: 1px;
	}

	.toggler-line.half::before {
		content: '';
		background-color: var(--bg-color);
		width: 6px;
		height: 2px;
		position: absolute; /* Konumunu kontrol etmek için */
		left: 0; /* Sol kenara yasla */
	}
</style>
