<script>
	import SidenavToggler from '@components/template/SidenavToggler.svelte';
	import { windowWidth } from '@constants/constant';
	export let id;
	export let cls;
</script>

<div {id} class="container-fluid p-0 {cls}">
	<nav class="px-5 py-3">
		<div>
			<div id="search-bar">
				<div class="icon-wrapper">
					<i class="bx bx-search-alt"></i>
				</div>
				<div class="input-wrapper">
					<input type="text" placeholder="Ara" />
				</div>
			</div>
		</div>
		<div class="d-flex gap-4">
			{#if $windowWidth < 1024}
				<div id="sidebar-collapse" class="">
					<SidenavToggler />
				</div>
			{/if}
			<div class="nav-icon-wrapper d-flex gap-0 justify-content-center align-items-center">
				<i class="bx bxs-bell"></i>
				<i class="bx bx-chevron-down"></i>
			</div>
			<div class="nav-icon-wrapper d-flex gap-0 justify-content-center align-items-center">
				<i class="bx bx-user-circle" style="font-size: 27px;"></i>
			</div>
		</div>
	</nav>
	<hr class="m-0" />
	<div class="content px-5 py-3">
		<slot />
	</div>
</div>

<style>
	.content {
		/* Div içi scroll burada --> # içerik kaydırma alanı */
		overflow: hidden;
		height: calc(100vh - 71px);
		overflow: auto;
	}
	nav {
		height: 70px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	hr {
		color: rgba(150, 150, 150, 0.5);
	}

	#search-bar {
		border-radius: 50px;
		display: flex;
		background-color: #445471;
		height: 40px;
		overflow: hidden;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
	}

	#search-bar .icon-wrapper {
		width: 40px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		justify-content: center;
		align-items: center;
	}
	#search-bar .icon-wrapper i {
		color: white;
		font-size: 21px;
	}

	#search-bar .input-wrapper input {
		border: none;
		outline: none;
		color: white;
		background-color: transparent;
		height: 100%;
	}

	#search-bar .input-wrapper input::placeholder {
		color: white;
	}
	.nav-icon-wrapper {
		cursor: pointer;
	}
	.nav-icon-wrapper i {
		font-size: 18px;
		color: rgb(90, 90, 90);
	}
</style>
