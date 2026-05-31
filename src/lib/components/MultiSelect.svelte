<script>
	import { createEventDispatcher, onMount } from 'svelte';

	// ── Props ──────────────────────────────────────────────────────────────────
	/** @type {{ id: any; name: string; icon?: string }[]} */
	export let options = [];

	/** Seçili değerlerin dizisi (bind:selected ile reaktif bağlantı) */
	export let selected = [];

	/** Alan etiketi */
	export let label = '';

	/** Placeholder text */
	export let placeholder = 'Seçiniz…';

	/** Maksimum seçim sayısı (undefined = sınırsız) */
	export let max = undefined;

	/** Devre dışı bırak */
	export let disabled = false;

	/** Search bar göster */
	export let searchable = true;

	// ── Internal ───────────────────────────────────────────────────────────────
	const dispatch = createEventDispatcher();

	let open = false;
	let searchQuery = '';
	let wrapperEl;
	let inputEl;

	$: filtered = searchQuery.trim()
		? options.filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: options;

	$: isSelected = (id) => selected.some((s) => s === id);
	$: reachedMax = max !== undefined && selected.length >= max;

	function toggle(option) {
		if (disabled) return;
		if (isSelected(option.id)) {
			selected = selected.filter((s) => s !== option.id);
		} else {
			if (reachedMax) return;
			selected = [...selected, option.id];
		}
		dispatch('change', selected);
	}

	function remove(val, e) {
		e.stopPropagation();
		selected = selected.filter((s) => s !== val);
		dispatch('change', selected);
	}

	function clear(e) {
		e.stopPropagation();
		selected = [];
		dispatch('change', selected);
	}

	function openDropdown() {
		if (disabled) return;
		open = true;
		searchQuery = '';
		setTimeout(() => inputEl?.focus(), 50);
	}

	function handleDocClick(e) {
		if (wrapperEl && !wrapperEl.contains(e.target)) {
			open = false;
			searchQuery = '';
		}
	}

	function nameOf(id) {
		return options.find((o) => o.id === id)?.name ?? id;
	}

	function iconOf(id) {
		return options.find((o) => o.id === id)?.icon;
	}

	onMount(() => {
		document.addEventListener('click', handleDocClick);
		return () => document.removeEventListener('click', handleDocClick);
	});
</script>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div class="ms-wrapper" class:disabled bind:this={wrapperEl}>
	{#if label}
		<label class="ms-label">{label}</label>
	{/if}

	<!-- Trigger -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="ms-control" class:open class:has-value={selected.length > 0} on:click={openDropdown}>
		<div class="ms-tags">
			{#if selected.length === 0}
				<span class="ms-placeholder">{placeholder}</span>
			{:else}
				{#each selected as id (id)}
					<span class="ms-tag">
						{#if iconOf(id)}<i class="bx {iconOf(id)}"></i>{/if}
						{nameOf(id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<span class="ms-tag-remove" on:click={(e) => remove(id, e)}>
							<i class="bx bx-x"></i>
						</span>
					</span>
				{/each}
			{/if}
		</div>

		<div class="ms-actions">
			{#if selected.length > 0}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<span class="ms-clear" title="Temizle" on:click={clear}>
					<i class="bx bx-x-circle"></i>
				</span>
			{/if}
			<span class="ms-arrow" class:rotated={open}>
				<i class="bx bx-chevron-down"></i>
			</span>
		</div>
	</div>

	<!-- Dropdown -->
	{#if open}
		<div class="ms-dropdown">
			{#if searchable}
				<div class="ms-search">
					<i class="bx bx-search"></i>
					<input bind:this={inputEl} bind:value={searchQuery} type="text" placeholder="Ara…" />
				</div>
			{/if}

			{#if max !== undefined}
				<div class="ms-count-bar">
					<span class="ms-count-text">{selected.length} / {max} seçildi</span>
					<div class="ms-count-track">
						<div class="ms-count-fill" style="width: {(selected.length / max) * 100}%"></div>
					</div>
				</div>
			{/if}

			<ul class="ms-list">
				{#if filtered.length === 0}
					<li class="ms-empty">
						<i class="bx bx-search-alt"></i>
						<span>Sonuç bulunamadı</span>
					</li>
				{:else}
					{#each filtered as option (option.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<li
							class="ms-option"
							class:selected={isSelected(option.id)}
							class:disabled={!isSelected(option.id) && reachedMax}
							on:click={() => toggle(option)}
						>
							<span class="ms-option-check">
								{#if isSelected(option.id)}
									<i class="bx bx-check"></i>
								{/if}
							</span>
							{#if option.icon}
								<i class="bx {option.icon} ms-option-icon"></i>
							{/if}
							<span class="ms-option-label">{option.name}</span>
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	{/if}
</div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<style>
	/* ── Tokens ─────────────────────────────────────────────────────────────── */
	.ms-wrapper {
		--primary: #f5365c;
		--primary-light: #f46481;
		--primary-glow: rgba(245, 54, 92, 0.18);
		--primary-tag-bg: rgba(245, 54, 92, 0.1);
		--primary-tag-border: rgba(245, 54, 92, 0.3);
		--text: #2d2d3a;
		--text-muted: #9a9ab0;
		--border: #e8e8f0;
		--bg: #ffffff;
		--bg-hover: #fdf4f6;
		--radius: 10px;
		--shadow: 0 4px 20px rgba(245, 54, 92, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
		--transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);

		position: relative;
		font-family: inherit;
		width: 100%;
	}

	.ms-wrapper.disabled {
		opacity: 0.55;
		pointer-events: none;
	}

	/* ── Label ──────────────────────────────────────────────────────────────── */
	.ms-label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 6px;
	}

	/* ── Control (trigger) ──────────────────────────────────────────────────── */
	.ms-control {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 42px;
		padding: 6px 12px;
		background: var(--bg);
		border: 1.5px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			border-color var(--transition),
			box-shadow var(--transition);
		user-select: none;
	}

	.ms-control:hover {
		border-color: var(--primary-light);
	}

	.ms-control.open {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--primary-glow);
	}

	/* ── Tags area ──────────────────────────────────────────────────────────── */
	.ms-tags {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		min-width: 0;
	}

	.ms-placeholder {
		color: var(--text-muted);
		font-size: 14px;
		line-height: 28px;
	}

	/* ── Tag pill ───────────────────────────────────────────────────────────── */
	.ms-tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px 2px 10px;
		background: var(--primary-tag-bg);
		border: 1px solid var(--primary-tag-border);
		border-radius: 20px;
		color: var(--primary);
		font-size: 12.5px;
		font-weight: 600;
		line-height: 1;
		height: 26px;
		animation: tagIn 160ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	@keyframes tagIn {
		from {
			opacity: 0;
			transform: scale(0.75);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.ms-tag i {
		font-size: 13px;
	}

	.ms-tag-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		cursor: pointer;
		margin-left: 2px;
		color: var(--primary);
		transition:
			background var(--transition),
			color var(--transition);
	}

	.ms-tag-remove:hover {
		background: var(--primary);
		color: white;
	}

	.ms-tag-remove i {
		font-size: 13px;
		line-height: 1;
	}

	/* ── Actions (clear + arrow) ────────────────────────────────────────────── */
	.ms-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.ms-clear {
		display: flex;
		align-items: center;
		color: var(--text-muted);
		font-size: 16px;
		cursor: pointer;
		transition: color var(--transition);
	}

	.ms-clear:hover {
		color: var(--primary);
	}

	.ms-arrow {
		display: flex;
		align-items: center;
		color: var(--text-muted);
		font-size: 18px;
		transition:
			transform var(--transition),
			color var(--transition);
	}

	.ms-arrow.rotated {
		transform: rotate(180deg);
		color: var(--primary);
	}

	/* ── Dropdown ───────────────────────────────────────────────────────────── */
	.ms-dropdown {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		background: var(--bg);
		border: 1.5px solid var(--primary-tag-border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		z-index: 999;
		overflow: hidden;
		animation: dropIn 180ms cubic-bezier(0.34, 1.3, 0.64, 1) both;
	}

	@keyframes dropIn {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ── Search ─────────────────────────────────────────────────────────────── */
	.ms-search {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
	}

	.ms-search i {
		color: var(--text-muted);
		font-size: 16px;
		flex-shrink: 0;
	}

	.ms-search input {
		border: none;
		outline: none;
		width: 100%;
		font-size: 13.5px;
		color: var(--text);
		background: transparent;
	}

	.ms-search input::placeholder {
		color: var(--text-muted);
	}

	/* ── Count bar ──────────────────────────────────────────────────────────── */
	.ms-count-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--border);
	}

	.ms-count-text {
		font-size: 11px;
		font-weight: 600;
		color: var(--primary);
		white-space: nowrap;
	}

	.ms-count-track {
		flex: 1;
		height: 4px;
		background: var(--primary-tag-bg);
		border-radius: 99px;
		overflow: hidden;
	}

	.ms-count-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--primary-light), var(--primary));
		border-radius: 99px;
		transition: width 300ms ease;
	}

	/* ── List ───────────────────────────────────────────────────────────────── */
	.ms-list {
		list-style: none;
		margin: 0;
		padding: 6px 0;
		max-height: 220px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--primary-tag-border) transparent;
	}

	.ms-list::-webkit-scrollbar {
		width: 4px;
	}

	.ms-list::-webkit-scrollbar-thumb {
		background: var(--primary-tag-border);
		border-radius: 99px;
	}

	/* ── Option ─────────────────────────────────────────────────────────────── */
	.ms-option {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 14px;
		cursor: pointer;
		font-size: 13.5px;
		color: var(--text);
		transition:
			background var(--transition),
			color var(--transition);
	}

	.ms-option:hover:not(.disabled) {
		background: var(--bg-hover);
	}

	.ms-option.selected {
		background: var(--primary-tag-bg);
		color: var(--primary);
		font-weight: 600;
	}

	.ms-option.selected:hover {
		background: rgba(245, 54, 92, 0.14);
	}

	.ms-option.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Check box */
	.ms-option-check {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		border: 1.5px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition:
			border-color var(--transition),
			background var(--transition);
	}

	.ms-option.selected .ms-option-check {
		background: var(--primary);
		border-color: var(--primary);
		color: white;
	}

	.ms-option-check i {
		font-size: 13px;
		line-height: 1;
	}

	.ms-option-icon {
		font-size: 16px;
		color: var(--primary-light);
		flex-shrink: 0;
	}

	.ms-option.selected .ms-option-icon {
		color: var(--primary);
	}

	.ms-option-label {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Empty state ────────────────────────────────────────────────────────── */
	.ms-empty {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px;
		color: var(--text-muted);
		font-size: 13px;
		font-style: italic;
	}

	.ms-empty i {
		font-size: 18px;
	}
</style>
