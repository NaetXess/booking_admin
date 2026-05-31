<script>
	import { onMount } from 'svelte';

	export let primary;
	export let danger;

	export let dropdown;
	export let dropdownCloseCondition = 'outside';

	export let theme;
	let elementAttributes = {};

	onMount(() => {
		if (primary) {
			theme = 'primary';
		} else if (danger) {
			theme = 'danger';
		}

		if (dropdown) {
			elementAttributes['data-bs-toggle'] = 'dropdown';
			elementAttributes['data-bs-auto-close'] = dropdownCloseCondition;
		}
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span class="t-badge {theme}" {...elementAttributes} on:click><slot /></span>

<style>
	.t-badge {
		padding: 4px 15px;
		font-size: 11px;
		font-weight: bold;
		border-radius: 30px;
		user-select: none;
		cursor: pointer;
	}

	.t-badge.danger {
		background-color: rgba(255, 110, 139, 0.25);
		color: #ff5a7b;
	}

	.t-badge.primary {
		background-color: rgba(88, 180, 255, 0.25);
		color: rgb(69, 171, 255);
	}

	.t-badge.purple {
		background-color: #f3e8ff;
		color: #7e22ce;
	}

	.t-badge.orange {
		background-color: #ffedd5;
		color: #c2410c;
	}

	.t-badge.pink {
		background-color: #fce7f3;
		color: #be185d;
	}

	.t-badge.green {
		background-color: #dcfce7;
		color: #15803d;
	}
</style>
