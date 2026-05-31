<script>
	import { createEventDispatcher } from 'svelte';
	import { sourceLabel } from '@constants/constant';
	import { formatDate } from '@utils/function';

	export let customers = [];
	// Beklenen obje: { id, name, phone, email, source, status, registrationDate }

	let searchQuery = '';
	let selectedCustomer = null;
	const dispatch = createEventDispatcher();

	$: filteredCustomers = customers.filter((c) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		const nameMatch = c.name?.toLowerCase().includes(query);
		const phoneMatch = c.phone?.toLowerCase().includes(query);
		return nameMatch || phoneMatch;
	});

	function selectCustomer(customer) {
		selectedCustomer = customer;
	}

	function confirmSelection() {
		if (selectedCustomer) {
			dispatch('confirm', selectedCustomer);
		}
	}

	// Çift tıklandığında hem seçip hem direkt onayla (tamam'a basmış gibi)
	function handleDoubleClick(customer) {
		selectCustomer(customer);
		confirmSelection();
	}
</script>

<div class="customer-selector">
	<div class="search-box">
		<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
		</svg>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="İsim veya telefon numarası ile müşteri ara..."
			class="search-input"
		/>
	</div>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>Müşteri</th>
					<th>Telefon</th>
					<th>E-posta</th>
					<th>Kaynak</th>
					<th>Durum</th>
					<th>Kayıt Tarihi</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredCustomers.length > 0}
					{#each filteredCustomers as customer (customer.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<tr
							class:selected={selectedCustomer?.id === customer.id}
							on:click={() => selectCustomer(customer)}
							on:dblclick={() => handleDoubleClick(customer)}
						>
							<td>
								<div class="customer-name">{customer.name}</div>
							</td>
							<td>{customer.phone1 || '-'}</td>
							<td><div class="truncate" title={customer.mail}>{customer.mail || '-'}</div></td>
							<td>
								<span class="badge source">{sourceLabel(customer.source)}</span>
							</td>
							<td>
								<span
									class="badge status"
									class:active={customer.active === 1}
									class:passive={customer.active === 0}
								>
									{customer.active == 1 ? 'Aktif' : 'Pasif'}
								</span>
							</td>
							<td>{formatDate(customer.createdat, 9)}</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="6" class="no-results">
							<div class="no-results-content">Arama kriterlerinize uygun müşteri bulunamadı.</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<div class="actions">
		<div class="selected-info">
			{#if selectedCustomer}
				Seçili: <strong>{selectedCustomer.name}</strong>
			{:else}
				<span class="muted">Lütfen listeden bir müşteri seçin</span>
			{/if}
		</div>
		<button class="btn-confirm" disabled={!selectedCustomer} on:click={confirmSelection}>
			Tamam
		</button>
	</div>
</div>

<style>
	.customer-selector {
		display: flex;
		flex-direction: column;
		gap: 20px;
		height: 100%;
	}

	.search-box {
		position: relative;
		width: 100%;
	}

	.search-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		width: 18px;
		height: 18px;
		color: #9ca3af;
	}

	.search-input {
		width: 100%;
		padding: 12px 16px 12px 42px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		outline: none;
		transition: all 0.2s;
		box-sizing: border-box;
		color: #374151;
	}

	.search-input:focus {
		border-color: #f46481; /* Sizin default buton/tema rengi */
		box-shadow: 0 0 0 3px rgba(244, 100, 129, 0.15);
	}

	.table-wrapper {
		flex: 1;
		min-height: 300px;
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) inset;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.9rem;
	}

	thead th {
		position: sticky;
		top: 0;
		background-color: #f9fafb;
		padding: 14px 16px;
		color: #4b5563;
		font-weight: 600;
		border-bottom: 2px solid #e5e7eb;
		z-index: 1;
		white-space: nowrap;
	}

	tbody td {
		padding: 12px 16px;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
	}

	tbody tr {
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	tbody tr:hover:not(.selected) {
		background-color: #f9fafb;
	}

	tbody tr.selected {
		background-color: rgba(244, 100, 129, 0.08); /* Seçili satır hafif tema rengi */
	}

	tbody tr.selected td:first-child {
		position: relative;
	}

	/* Seçili satırın sol başına renkli marker/çizgi atalım */
	tbody tr.selected td:first-child::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background-color: #f46481;
	}

	.customer-name {
		font-weight: 500;
		color: #111827;
	}

	.truncate {
		max-width: 150px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.badge {
		padding: 4px 10px;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.3px;
	}

	.badge.source {
		background-color: #f3f4f6;
		color: #4b5563;
	}

	.badge.status.active {
		background-color: #d1fae5;
		color: #065f46;
	}

	.badge.status.passive {
		background-color: #fee2e2;
		color: #991b1b;
	}

	.no-results {
		text-align: center;
		padding: 48px 16px;
	}

	.no-results-content {
		color: #6b7280;
		background: #f9fafb;
		display: inline-block;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 4px;
	}

	.selected-info {
		font-size: 0.9rem;
		color: #374151;
	}

	.selected-info .muted {
		color: #9ca3af;
		font-style: italic;
	}

	.btn-confirm {
		padding: 10px 28px;
		background-color: #f46481;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow:
			0 4px 6px -1px rgba(244, 100, 129, 0.2),
			0 2px 4px -1px rgba(244, 100, 129, 0.1);
	}

	.btn-confirm:hover:not(:disabled) {
		background-color: #e6516e;
		transform: translateY(-1px);
		box-shadow:
			0 6px 8px -1px rgba(244, 100, 129, 0.3),
			0 4px 6px -1px rgba(244, 100, 129, 0.2);
	}

	.btn-confirm:disabled {
		background-color: #e5e7eb;
		color: #9ca3af;
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
