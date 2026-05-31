<script>
	export let classess;
	export let id;
	export let value;
	export let disabled;
	export let icon;
</script>

<div class="input-wrap select-wrap">
	<i class="bx {icon}"></i>
	<select on:change {disabled} bind:value class={classess} {id}>
		<slot />
	</select>
	<i class="bx bx-chevron-down chevron"></i>
</div>

<style>
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

	.input-wrap select {
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

	.select-wrap {
		position: relative;
	}
	.select-wrap select {
		appearance: none;
		cursor: pointer;
		padding-right: 36px;
	}
	.chevron {
		position: absolute;
		right: 10px;
		font-size: 16px;
		color: #b0b8c4;
		pointer-events: none;
	}
</style>
