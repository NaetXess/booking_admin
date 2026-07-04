<!-- UserSearchPicker.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	// const dispatch = createEventDispatcher();

	/** @type {{value?: any, height?: string, users?: any}} */
	let { value = $bindable(null), height = '100%', users = [] } = $props();

	let query = $state('');

	// $: dispatch('input', {
	// 	data: {
	// 		user_id: value
	// 	}
	// });

	// Avatar için isim baş harfleri
	function initials(name) {
		return name
			.split(' ')
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	}

	// Deterministik renk — aynı isim hep aynı renk
	const COLORS = [
		'#f5365c',
		'#7c4dff',
		'#00bcd4',
		'#ff6f00',
		'#43a047',
		'#e91e63',
		'#1e88e5',
		'#f4b400'
	];
	function avatarColor(name) {
		let hash = 0;
		for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
		return COLORS[Math.abs(hash) % COLORS.length];
	}

	let filtered = $derived(users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())));
</script>

<div class="picker">
	<!-- Search -->
	<div class="search-wrap">
		<i class="bx bx-search"></i>
		<input type="text" placeholder="Kullanıcı ara..." bind:value={query} />
		{#if query}
			<button class="clear" onclick={() => (query = '')}>
				<i class="bx bx-x"></i>
			</button>
		{/if}
	</div>

	<!-- List -->
	<div class="list" style="height:{height}">
		{#if filtered.length === 0}
			<div class="empty">Kullanıcı bulunamadı</div>
		{/if}

		{#each filtered as user}
			<button
				class="user-row"
				class:selected={value === user.id}
				onclick={() => (value = user.id)}
			>
				<!-- Avatar -->
				<div class="avatar" style="background:{avatarColor(user.name)}">
					{initials(user.name)}
				</div>

				<!-- Info -->
				<div class="info">
					<span class="name">{user.name}</span>
					<span class="mail">{user.mail}</span>
				</div>

				<!-- Seçili işareti -->
				{#if value === user.id}
					<i class="bx bx-check-circle check-icon"></i>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.picker {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
		display: flex;
		flex-direction: column;
		height: 200px;
	}

	/* Search */
	.search-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-bottom: 1px solid #f0f0f0;
	}

	.search-wrap i {
		font-size: 18px;
		color: #aaa;
	}

	.search-wrap input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 0.9rem;
		color: #333;
		background: transparent;
	}

	.search-wrap input::placeholder {
		color: #bbb;
	}

	.clear {
		background: none;
		border: none;
		cursor: pointer;
		color: #bbb;
		padding: 0;
		display: flex;
	}

	/* List */
	.list {
		overflow-y: auto;
		padding: 8px;
	}

	.list::-webkit-scrollbar {
		width: 4px;
	}

	.list::-webkit-scrollbar-thumb {
		background: #eee;
		border-radius: 4px;
	}

	/* Row */
	.user-row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 10px;
		border-radius: 10px;
		border: 2px solid transparent;
		background: none;
		cursor: pointer;
		transition: all 150ms ease;
		text-align: left;
	}

	.user-row:hover {
		background: #fafafa;
	}

	.user-row.selected {
		background: #fff5f7;
		border-color: #f5365c;
	}

	/* Avatar */
	.avatar {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
	}

	/* Info */
	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #222;
	}

	.mail {
		font-size: 0.8rem;
		font-weight: 400;
		color: #6e6e6e;
	}

	.check-icon {
		font-size: 20px;
		color: #f5365c;
	}

	.empty {
		text-align: center;
		padding: 32px;
		color: #bbb;
		font-size: 0.85rem;
	}
</style>
