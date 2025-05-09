<script>
	import { createEventDispatcher, onMount } from 'svelte';

	export let type = '';
	export let classes = '';
	export let id = '';
	export let placeholder = '';
	export let value;

	export let disabled = false;
	export let disableShowPass = false;

	// export let mainValue = '';

	// const dispatch = createEventDispatcher();

	function changeIcon(el) {
		const input = document.getElementById(id);

		if (el.classList.contains('bx-hide')) {
			el.classList.remove('bx-hide');
			el.classList.add('bx-show');
			input.setAttribute('type', 'text');
		} else if (el.classList.contains('bx-show')) {
			el.classList.remove('bx-show');
			el.classList.add('bx-hide');
			input.setAttribute('type', 'password');
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if type === 'email'}
	<input
		on:input
		{disabled}
		bind:value
		type="email"
		class="form-control {classes}"
		{id}
		autocomplete="off"
		{placeholder}
	/>
{:else if type === 'password'}
	<div class="position-relative">
		<input
			{disabled}
			bind:value
			on:input
			type="password"
			class="form-control {classes}"
			{id}
			{placeholder}
		/>
		{#if !disableShowPass}
			<span
				on:click={(e) => {
					changeIcon(e.target);
				}}
			>
				<i id="password-icon" class="bx bx-hide"></i>
			</span>
		{/if}
	</div>
{:else if type === 'textarea'}
	<textarea on:input bind:value rows="5" class="form-control {classes}" {id} {placeholder}
	></textarea>
	<!-- {:else if type === 'custom-password'}
	<div class="position-relative">
		<input
			{disabled}
			on:input
			on:input={(e) => {
				if (e.inputType !== 'deleteContentBackward' && e.inputType !== 'deleteWordBackward') {
					let _val = '';
					mainValue += e.data;
					_val = mainValue.replace(/./g, '*');
					let el = document.getElementById(id);
					el.value = _val;
				} else if (e.inputType == 'deleteWordBackward') {
					mainValue = '';
				} else {
					mainValue = mainValue.slice(0, -1);
				}

				dispatch('value', mainValue);
			}}
			type="text"
			class="form-control {classes}"
			{id}
			{placeholder}
			autocomplete="off"
		/>
		{#if !disableShowPass}
			<span
				on:click={(e) => {
					changeIcon2(e.target);
				}}
			>
				<i id="password-icon" class="bx bx-hide"></i>
			</span>
		{/if}
	</div> -->
{:else if type == 'number'}
	<input
		on:input
		{disabled}
		bind:value
		type="number"
		class="form-control {classes}"
		autocomplete="off"
		{id}
		{placeholder}
	/>
{:else}
	<input
		on:input
		{disabled}
		bind:value
		type="text"
		class="form-control {classes}"
		autocomplete="off"
		{id}
		{placeholder}
	/>
{/if}

<style>
	#password-icon {
		cursor: pointer;
		font-size: 20px;
		position: absolute;
		top: 50%;
		right: 0;
		transform: translate(-50%, -50%);
	}
</style>
