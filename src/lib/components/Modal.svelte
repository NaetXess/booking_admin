<script>
	import { createEventDispatcher, onMount } from 'svelte';

	export let title = '';
	export let show = false;

	const dispatch = createEventDispatcher();

	function close() {
		show = false;
		dispatch('close');
	}

	// ESC tuşuna basıldığında modalı kapat
	function handleKeydown(e) {
		if (show && e.key === 'Escape') close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-backdrop" on:click={close}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">{title}</h3>
				<button class="close-btn" on:click={close}>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: #fff;
		border-radius: 12px;
		width: 90%;
		max-width: 850px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #f0f2f5;
	}

	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		color: #111827;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		padding: 4px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background-color: #f3f4f6;
		color: #111827;
	}

	.modal-body {
		padding: 24px;
		overflow-y: auto;
		flex: 1;
	}

	@keyframes scaleUp {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
