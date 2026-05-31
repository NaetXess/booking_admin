<script>
	import { createEventDispatcher, onMount } from 'svelte';

	export let type = '';
	export let classes = '';
	export let id = '';
	export let placeholder = '';
	export let value;
	export let min;
	export let max;
	export let icon;

	export let disabled = false;
	export let autoFilled = false;
	export let disableShowPass = false;
	export let rows = 3;

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
	<div class="input-wrap {autoFilled ? 'auto-fill' : ''}">
		<i class="bx {icon}"></i>
		<input
			on:input
			{disabled}
			bind:value
			type="email"
			class={classes}
			{id}
			autocomplete="off"
			{placeholder}
		/>
	</div>
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
	<textarea on:input bind:value {rows} class={classes} {id} {placeholder}></textarea>
{:else if type == 'number'}
	<div class="input-wrap {autoFilled ? 'auto-fill' : ''}">
		<i class="bx {icon}"></i>
		<input
			on:input
			{disabled}
			bind:value
			type="number"
			class={classes}
			autocomplete="off"
			{id}
			{placeholder}
		/>
	</div>
{:else if type == 'date'}
	<div class="input-wrap {autoFilled ? 'auto-fill' : ''}">
		<i class="bx {icon}"></i>
		<input on:input {disabled} bind:value type="date" class={classes} {id} {min} {max} />
	</div>
{:else if type == 'time'}
	<div class="input-wrap {autoFilled ? 'auto-fill' : ''}">
		<i class="bx {icon}"></i>
		<input on:input {disabled} bind:value type="time" class={classes} {id} {min} {max} />
	</div>
{:else}
	<div class="input-wrap {autoFilled ? 'auto-fill' : ''}">
		<i class="bx {icon}"></i>
		<input
			on:input
			{disabled}
			bind:value
			type="text"
			class={classes}
			autocomplete="off"
			{id}
			{placeholder}
		/>
	</div>
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
	/* Aynı kodlar inputlarda */
	.input-wrap {
		display: flex;
		align-items: center;
		gap: 0;
		border: 1.5px solid #ebedf0;
		border-radius: 9px;
		background: #fafbfc;
		overflow: hidden;
		transition:
			border-color 150ms,
			box-shadow 150ms;
	}
	.input-wrap:focus-within {
		border-color: #f5365c;
		background: white;
		box-shadow: 0 0 0 3px rgba(245, 54, 92, 0.07);
	}
	.input-wrap > i:first-child {
		padding: 0 10px 0 12px;
		font-size: 16px;
		color: #c4cad4;
		flex-shrink: 0;
	}
	/* Aynı kodlar inputlarda */
	.input-wrap input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		font-size: 13.5px;
		color: #252c38;
		padding: 10px 12px 10px 0;
		font-family: inherit;
		width: 100%;
	}
	.input-wrap input::placeholder {
		color: #c4cad4;
	}

	.input-wrap.auto-fill {
		background-color: rgba(
			244,
			100,
			129,
			0.03
		); /* Yok denecek kadar az, çok transparan bir tema rengi */
		border: 1px solid rgba(244, 100, 129, 0.3); /* Çok hafif tema rengi çerçeve */
		color: #4b5563; /* Yazı rengi koyu, okunabilir */

		/* İkon eklemek için (Opsiyonel) */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f46481' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'%3E%3C/path%3E%3Cpolyline points='22 4 12 14.01 9 11.01'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		background-size: 16px;
		padding-right: 36px; /* İkon yazının üstüne binmesin diye */
	}

	textarea {
		width: 100%;
		border: 1.5px solid #ebedf0;
		border-radius: 9px;
		background: #fafbfc;
		padding: 10px 14px;
		font-size: 13.5px;
		color: #252c38;
		font-family: inherit;
		outline: none;
		resize: vertical;
		box-sizing: border-box;
		transition:
			border-color 150ms,
			box-shadow 150ms;
	}
	textarea:focus {
		border-color: #f5365c;
		background: white;
		box-shadow: 0 0 0 3px rgba(245, 54, 92, 0.07);
	}
	textarea::placeholder {
		color: #c4cad4;
	}
</style>
