<script>
	export let value = 'personnel';

	const options = [
		{
			id: 1,
			title: 'Personel',
			subtitle: 'Çalışan ve ekip',
			feature: '',
			icon: 'bx bx-user-pin',
			active: 1
		},
		{
			id: 2,
			title: 'Oda',
			subtitle: 'Mekan yönetimi',
			feature: '(Yakında Gelecek)',
			icon: 'bx bx-home-circle',
			active: 0
		},
		{
			id: 3,
			title: 'Masa',
			subtitle: 'Masa düzeni',
			feature: '(Yakında Gelecek)',
			icon: 'bx bx-table',
			active: 0
		}
	];
</script>

<div class="radio-card-group">
	{#each options as option}
		<button
			type="button"
			class="radio-card {option.active == 1 ? 'active-card' : ''}"
			class:selected={value === option.id}
			on:click={() => (option.active == 1 ? (value = option.id) : '')}
		>
			<div class="card-icon">
				<i class={option.icon}></i>
			</div>
			<span class="card-title">{option.title}</span>
			<span class="card-subtitle">{option.subtitle}</span>
			<span class="card-subtitle">{option.feature}</span>
			<div class="radio-dot" class:active={value === option.id}></div>
		</button>
	{/each}
</div>

<style>
	.radio-card-group {
		display: flex;
		flex-direction: row;
		gap: 20px;
		justify-content: center;
	}

	.radio-card {
		flex: 1;
		/* width: 180px; */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 20px 12px 16px;
		border: 2px solid #e8e8e8;
		border-radius: 14px;
		background: #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		transition: all 180ms ease;
		text-align: center;
		color: #333;
	}

	.radio-card.active-card:hover {
		border-color: #f5365c;
		background: #fff5f7;
	}

	.radio-card.selected {
		border-color: #f5365c;
		background: #fff5f7;
		color: #f5365c;
	}

	/* İkon */
	.card-icon {
		width: 46px;
		height: 46px;
		border-radius: 12px;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 180ms ease;
	}

	.radio-card.selected .card-icon {
		background: rgba(245, 54, 92, 0.12);
	}

	.card-icon i {
		font-size: 22px;
		color: #aaa;
		transition: color 180ms ease;
	}

	.radio-card.selected .card-icon i {
		color: #f5365c;
	}

	/* Metin */
	.card-title {
		font-size: 0.88rem;
		font-weight: 700;
		line-height: 1;
	}

	.card-subtitle {
		font-size: 0.7rem;
		color: #aaa;
		line-height: 1;
	}

	.radio-card.selected .card-subtitle {
		color: rgba(245, 54, 92, 0.6);
	}

	/* Radio noktası */
	.radio-dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid #ddd;
		position: relative;
		margin-top: 4px;
		transition: border-color 180ms ease;
	}

	.radio-dot::after {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		background: #f5365c;
		transform: scale(0);
		transition: transform 180ms ease;
	}

	.radio-dot.active {
		border-color: #f5365c;
	}

	.radio-dot.active::after {
		transform: scale(1);
	}
</style>
