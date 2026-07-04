<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function onCancel() {
		dispatch('cancel');
	}

	function onConfirm() {
		dispatch('confirm');
	}

	/** @type {{text?: string, boldWord?: string, type?: number}} */
	let { text = '', boldWord = '', type = 1 } = $props();
</script>

<div class="content">
	<div class="icon">
		{#if type == 1}
			⚠️
		{/if}
	</div>

	<h2>
		{#if type == 1}
			Silme İşlemi
		{/if}
	</h2>

	<p>
		<strong>{boldWord}</strong>
		{text}
	</p>

	<div class="actions">
		<button class="confirm" onclick={onConfirm}> Evet, Sil </button>
		<button class="cancel" onclick={onCancel}> Hayır </button>
	</div>
</div>

<style>
	.content {
		text-align: center;
		padding: 10px 5px;
	}

	.icon {
		font-size: 34px;
		margin-bottom: 10px;
	}

	h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
	}

	p {
		margin: 12px 0 20px;
		color: #555;
	}

	.actions {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	button {
		padding: 10px 18px;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		font-weight: 600;
		transition: 0.2s;
	}

	.cancel {
		background: #eee;
		color: #333;
	}

	.confirm {
		background: rgb(244, 100, 129);
		color: white;
	}

	.confirm:hover {
		filter: brightness(0.95);
	}
</style>
