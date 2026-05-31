<script>
	import { goto } from '$app/navigation';
	import { formatDate } from '@utils/function';
	export let conflicts = [];

	function goToPlan(id) {
		goto(`/reservations/conflict/${id}`);
	}
</script>

<div class="conflict-widget">
	<!-- Header -->
	<div class="widget-header">
		<div class="header-left">
			<div class="icon-wrap">
				<i class="bx bx-error-alt"></i>
			</div>
			<div>
				<h6 class="widget-title">Çakışan Planlı Randevular</h6>
				<p class="widget-subtitle">Müdahale gerektiren durumlar</p>
			</div>
		</div>
		{#if conflicts.length > 0}
			<span class="count-badge">{conflicts.length}</span>
		{/if}
	</div>

	<!-- List -->
	<div class="conflict-list">
		{#if conflicts.length === 0}
			<div class="empty-state">
				<i class="bx bx-check-circle"></i>
				<p>Çakışan randevu bulunmuyor</p>
			</div>
		{:else}
			{#each conflicts as item (item.id)}
				<div class="conflict-item">
					<div class="item-left">
						<div class="item-dot"></div>
						<div class="item-info">
							<span class="item-customer">{item.customer.name}</span>
							<span class="item-service">{item.service.name}</span>
							<div class="item-meta">
								<span class="meta-tag">
									<i class="bx bx-calendar"></i>
									{formatDate(item.scheduled_date)}
								</span>
								<span class="meta-tag">
									<i class="bx bx-time-five"></i>
									{item.scheduled_time?.slice(0, 5)}
								</span>
								<span class="meta-tag reason">
									<i class="bx bx-block"></i>
									{#if item.status == 4}
										Kapasite Dolu/Çalışma Saati Dışı
									{:else if item.status == 6}
										Sistem Hatası
									{/if}
								</span>
							</div>
						</div>
					</div>
					<button class="go-btn" on:click={() => goToPlan(item.id)} title="Plana git">
						<i class="bx bx-right-arrow-alt"></i>
					</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.conflict-widget {
		background: white;
		border-radius: 8px;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	/* Header */
	.widget-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #f1f1f1;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.icon-wrap {
		width: 38px;
		height: 38px;
		border-radius: 8px;
		background: rgba(245, 54, 92, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-wrap i {
		font-size: 1.2rem;
		color: #f5365c;
	}

	.widget-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #2c3e50;
		margin: 0;
		line-height: 1.2;
	}

	.widget-subtitle {
		font-size: 0.75rem;
		color: #9ba3af;
		margin: 0;
	}

	.count-badge {
		background: rgba(245, 54, 92, 0.12);
		color: #f5365c;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 3px 10px;
		border-radius: 20px;
		flex-shrink: 0;
	}

	/* List */
	.conflict-list {
		padding: 0.5rem 0;
		overflow-y: auto;
		height: 261px;
	}

	.conflict-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		transition: background 120ms ease;
		gap: 0.75rem;
	}

	.conflict-item:hover {
		background: #fafafa;
	}

	.conflict-item:not(:last-child) {
		border-bottom: 1px solid #f5f5f5;
	}

	.item-left {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.item-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f5365c;
		flex-shrink: 0;
		margin-top: 5px;
	}

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.item-customer {
		font-size: 0.85rem;
		font-weight: 600;
		color: #2c3e50;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-service {
		font-size: 0.78rem;
		color: #6b7280;
	}

	.item-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.25rem;
	}

	.meta-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 0.72rem;
		color: #9ba3af;
		background: #f5f7fa;
		padding: 2px 7px;
		border-radius: 4px;
	}

	.meta-tag i {
		font-size: 0.75rem;
	}

	.meta-tag.reason {
		background: rgba(245, 54, 92, 0.08);
		color: #f5365c;
	}

	/* Go button */
	.go-btn {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		border: 1px solid #e9ecef;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		transition: all 150ms ease;
		color: #6b7280;
	}

	.go-btn i {
		font-size: 1.1rem;
		transition: transform 150ms ease;
	}

	.go-btn:hover {
		background: #f5365c;
		border-color: #f5365c;
		color: white;
	}

	.go-btn:hover i {
		transform: translateX(2px);
	}

	/* Empty */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem;
		color: #9ba3af;
	}

	.empty-state i {
		font-size: 2rem;
		color: #4caf50;
	}

	.empty-state p {
		font-size: 0.85rem;
		margin: 0;
	}
</style>
