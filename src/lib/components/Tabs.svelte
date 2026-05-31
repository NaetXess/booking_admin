<script>
	// Sekme listesini dışarıdan alıyoruz: örn: [{ id: 'tab1', label: 'Genel' }]
	export let items = [];

	// Varsayılan olarak ilk sekmeyi aktif yap
	export let activeTab = items.length > 0 ? items[0].id : null;
</script>

<div class="tabs-container">
	<!-- SEKMELERİN BAŞLIK (BUTON) KISMI -->
	<div class="tabs-header">
		{#each items as item}
			<button
				disabled={item.disabled}
				type="button"
				class="tab-btn"
				class:active={activeTab === item.id}
				on:click={() => (activeTab = item.id)}
			>
				{item.label}
			</button>
		{/each}
	</div>

	<!-- SEKMELERİN İÇERİK KISMI -->
	<div class="tabs-content">
		<!-- İçeriği buraya prop (slot) olarak dışarıdan basacağız -->
		<slot {activeTab} />
	</div>
</div>

<style>
	.tabs-container {
		width: 100%;
	}
	.tabs-header {
		display: flex;
		border-bottom: 2px solid #eaeaea;
		gap: 20px;
		margin-bottom: 20px;
	}
	.tab-btn {
		background: none;
		border: none;
		padding: 10px 15px;
		cursor: pointer;
		font-size: 15px;
		font-weight: 500;
		color: #666;
		position: relative;
		transition: color 0.3s;
		outline: none;
	}
	.tab-btn:hover {
		color: rgba(245, 54, 92, 1); /* Temanızın ana rengi */
	}
	.tab-btn.active {
		color: rgba(245, 54, 92, 1);
	}
	.tab-btn.active::after {
		content: '';
		position: absolute;
		bottom: -2px; /* Çizginin border ile üst üste tam oturması için */
		left: 0;
		width: 100%;
		height: 2px;
		background-color: rgba(245, 54, 92, 1);
		border-radius: 2px;
		transition: width 0.3s ease;
	}
	.tabs-content {
		padding: 5px 0;
	}
</style>
