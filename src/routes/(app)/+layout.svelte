<script>
	import { onMount } from 'svelte';
	import Sidebar from '@components/Sidebar.svelte';
	import { windowWidth } from '@constants/constant';
	import { handleFixSidebarSize, handleSidebarCollapse } from '@functions/sidebar';
	import { beforeNavigate } from '$app/navigation';
	import Page from '@components/Page.svelte';

	onMount(async () => {
		windowWidth.set(window.innerWidth);

		let sidebar = document.getElementById('sidebar-wrapper');
		window.addEventListener('resize', handleFixSidebarSize);

		sidebar.addEventListener('mouseenter', () => {
			let wrapper = document.getElementById('wrapper');

			if (!wrapper.classList.contains('sidebar-extended-temp')) {
				wrapper.classList.add('sidebar-extended-temp');
			}

			// Sidebar Başlık Bölümünü Gösterme
			let title = document.getElementById('side-title');
			let titleSmall = document.getElementById('side-title-small');

			setTimeout(() => {
				title.style.display = 'block';
				titleSmall.style.display = 'block';

				// Animasyon
				if (!wrapper.classList.contains('sidebar-extended')) {
					title.style.transform = 'scale(.8)';
					title.style.transition = 'transform linear 170ms';
					setTimeout(() => {
						title.style.transform = 'scale(1.3)';
						setTimeout(() => {
							title.style.transform = 'scale(1)';
						}, 90);
					}, 90);
				}
				// /Animasyon
			}, 90);
		});
		sidebar.addEventListener('mouseleave', () => {
			let wrapper = document.getElementById('wrapper');

			if (wrapper.classList.contains('sidebar-extended-temp')) {
				wrapper.classList.remove('sidebar-extended-temp');
			}

			// Sidebar Başlık Bölümünü Gizleme
			let title = document.getElementById('side-title');
			let titleSmall = document.getElementById('side-title-small');

			title.style.removeProperty('display');
			titleSmall.style.removeProperty('display');
		});
	});

	// beforeNavigate(({ cancel }) => {
	// 	cancel();
	// 	let wrapper = document.getElementById('wrapper');

	// 	if (wrapper.classList.contains('sidebar-open')) {
	// 		handleSidebarCollapse();
	// 	}
	// });

	document.addEventListener('click', (e) => {
		let wrapper = document.getElementById('wrapper');
		if (
			wrapper.classList.contains('sidebar-open') &&
			e.target.id != 'sidebar-wrapper' &&
			!e.target.closest('#sidebar-wrapper') &&
			e.target.id != 'sidebar-collapse' &&
			!e.target.closest('#sidebar-collapse')
		) {
			e.preventDefault();

			handleSidebarCollapse();
		}
	});
</script>

<div id="wrapper" class="wrapper sidebar-extended">
	<div id="sidebar-wrapper" class="sidebar">
		<Sidebar windowWidth={$windowWidth} />
	</div>

	<div id="content" class="content w-100">
		<div class="">
			<Page>
				<slot />
			</Page>
		</div>
	</div>
</div>

<style>
	.wrapper {
		background-color: rgb(240, 240, 240);
	}
</style>
