<script>
	/** @type {{selected?: any, label?: string}} */
	let { selected = $bindable([]), label = 'Hangi Günler Tekrar Etsin?' } = $props();

	const days = [
		{ id: 1, name: 'Pazartesi', short: 'Pzt' },
		{ id: 2, name: 'Salı', short: 'Sal' },
		{ id: 3, name: 'Çarşamba', short: 'Çar' },
		{ id: 4, name: 'Perşembe', short: 'Per' },
		{ id: 5, name: 'Cuma', short: 'Cum' },
		{ id: 6, name: 'Cumartesi', short: 'Cmt' },
		{ id: 7, name: 'Pazar', short: 'Paz' }
	];

	function toggleDay(id) {
		if (selected.includes(id)) {
			selected = selected.filter((d) => d !== id);
		} else {
			selected = [...selected, id].sort((a, b) => a - b);
		}
	}
</script>

<div class="day-picker-container">
	{#if label}
		<label class="form-label">{label}</label>
	{/if}
	<div class="day-picker d-flex flex-wrap gap-2">
		{#each days as day}
			<button
				type="button"
				class="day-btn {selected.includes(day.id) ? 'active' : ''}"
				onclick={() => toggleDay(day.id)}
			>
				<span class="day-short">{day.short}</span>
				<span class="day-full">{day.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.day-picker {
		width: 100%;
	}

	.day-btn {
		flex: 1;
		min-width: 45px;
		padding: 10px 5px;
		border: 1px solid #dee2e6;
		background-color: #f8f9fa;
		border-radius: 8px;
		color: #495057;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		outline: none;
	}

	.day-btn:hover:not(.active) {
		background-color: #e9ecef;
		border-color: #ced4da;
	}

	.day-btn.active {
		background-color: #f5365c;
		border-color: #f5365c;
		color: white;
		box-shadow: 0 4px 6px rgba(245, 54, 92, 0.2);
	}

	.day-short {
		display: none;
	}

	.day-full {
		display: block;
	}

	@media (max-width: 768px) {
		.day-short {
			display: block;
		}
		.day-full {
			display: none;
		}
		.day-btn {
			padding: 8px 4px;
		}
	}
</style>
