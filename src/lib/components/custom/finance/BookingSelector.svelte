<script>
	import { Search } from '@controllers/search';
	import { formatDate, debounce } from '@utils/function';

	/**
	 * @type {{
	 *   selectedBookingId?: string,
	 *   onSelect?: (booking: any) => void
	 * }}
	 */
	let { selectedBookingId = $bindable(''), onSelect = null } = $props();

	let query = $state('');
	let results = $state([]);
	let loading = $state(false);
	let showResults = $state(false);
	let selectedBooking = $state(null);

	const handleSearch = debounce(async (val) => {
		if (val.length < 2) {
			results = [];
			return;
		}
		loading = true;
		const res = await Search.search({ index: 'bookings', search_text: val });
		if (res) {
			results = res.items || [];
		}
		loading = false;
	}, 250);

	function select(booking) {
		selectedBooking = booking;
		selectedBookingId = booking.id;
		query = booking.customer?.name || booking.customer_name || '';
		showResults = false;
		onSelect?.(booking);
	}

	function clear() {
		selectedBooking = null;
		selectedBookingId = '';
		query = '';
		results = [];
		onSelect?.(null);
	}
</script>

<div class="bs-wrap">
	<div class="bs-input-wrap">
		<i class="bx bx-search bs-icon"></i>
		<input
			type="text"
			class="bs-input"
			placeholder="Rezervasyon arayın (müşteri adı, tel...)"
			bind:value={query}
			oninput={(e) => {
				showResults = true;
				handleSearch(e.target.value);
			}}
			onfocus={() => {
				showResults = true;
			}}
		/>
		{#if selectedBookingId}
			<button type="button" class="bs-clear-btn" onclick={clear}>
				<i class="bx bx-x"></i>
			</button>
		{/if}
	</div>

	{#if showResults && (loading || results.length > 0 || query.length >= 2)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bs-dropdown-backdrop" onclick={() => (showResults = false)}></div>

		<div class="bs-dropdown">
			{#if loading}
				<div class="bs-info-item"><i class="bx bx-loader-alt bx-spin"></i> Aranıyor...</div>
			{:else if results.length === 0}
				<div class="bs-info-item">Eşleşen rezervasyon bulunamadı.</div>
			{:else}
				{#each results as b}
					{@const name = b.customer?.name || b.customer_name || 'İsimsiz'}
					<button type="button" class="bs-item" onclick={() => select(b)}>
						<div class="bs-item-row">
							<span class="bs-item-name">{name}</span>
							<span class="bs-item-service">{b.service_name ?? ''}</span>
						</div>
						<div class="bs-item-row bs-item-sub">
							<span>{formatDate(b.checkin_date)} {b.checkin_time?.slice(0, 5)}</span>
							<span class="bs-item-id">#{b.id?.slice(0, 8)}</span>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.bs-wrap { position: relative; width: 100%; }
	.bs-input-wrap {
		position: relative; display: flex; align-items: center;
		border: 1.5px solid #ebedf0; border-radius: 9px;
		background: #fafbfc; transition: border-color 150ms;
	}
	.bs-input-wrap:focus-within { border-color: #f46481; background: white; }
	.bs-icon { position: absolute; left: 12px; color: #b0b8c4; font-size: 16px; pointer-events: none; }
	.bs-input {
		width: 100%; border: none; background: transparent; outline: none;
		padding: 10px 36px 10px 36px; font-size: 13px; color: #445471; font-family: inherit;
	}
	.bs-clear-btn {
		position: absolute; right: 8px; border: none; background: transparent;
		color: #9aa3b0; font-size: 18px; cursor: pointer; display: flex; align-items: center;
		padding: 4px; border-radius: 50%;
	}
	.bs-clear-btn:hover { background: #f0f2f5; color: #f5365c; }

	/* Dropdown */
	.bs-dropdown-backdrop { position: fixed; inset: 0; z-index: 99; }
	.bs-dropdown {
		position: absolute; top: calc(100% + 5px); left: 0; right: 0;
		background: white; border: 1px solid #ebedf0; border-radius: 10px;
		box-shadow: 0 10px 25px rgba(0,0,0,0.08); z-index: 100;
		max-height: 240px; overflow-y: auto; padding: 4px;
	}
	.bs-info-item { padding: 12px; text-align: center; font-size: 12.5px; color: #9aa3b0; }
	.bs-item {
		width: 100%; border: none; background: transparent; text-align: left;
		padding: 8px 12px; border-radius: 7px; cursor: pointer;
		display: flex; flex-direction: column; gap: 3px; transition: background 150ms;
		font-family: inherit;
	}
	.bs-item:hover { background: #f7f8fa; }
	.bs-item-row { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; }
	.bs-item-name { font-weight: 600; color: #1e2a3b; }
	.bs-item-service { font-size: 11px; background: rgba(244,100,129,0.1); color: #f46481; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
	.bs-item-sub { color: #9aa3b0; font-size: 11.5px; }
	.bs-item-id { font-family: monospace; font-size: 11px; color: #b0b8c4; }
</style>
