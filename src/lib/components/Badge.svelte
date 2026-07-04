<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { onMount } from 'svelte';



	/** @type {{primary: any, danger: any, dropdown: any, dropdownCloseCondition?: string, theme: any, children?: import('svelte').Snippet}} */
	let {
		primary,
		danger,
		dropdown,
		dropdownCloseCondition = 'outside',
		theme = $bindable(),
		children
	} = $props();
	let elementAttributes = $state({});

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="t-badge {theme}" {...elementAttributes} onclick={bubble('click')}>{@render children?.()}</span>

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
