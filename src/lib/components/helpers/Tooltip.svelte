<!-- Tooltip.svelte — Portal versiyonu -->
<script>
	export let text = '';
	export let position = 'top';

	let visible = false;
	let timer;
	let anchor; // trigger elementin ref'i
	let tooltip; // tooltip DOM ref'i

	function show() {
		clearTimeout(timer);
		visible = true;
		requestAnimationFrame(updatePos);
	}

	function hide() {
		timer = setTimeout(() => (visible = false), 150);
	}

	// Trigger'ın konumuna göre tooltip'i body'de konumlandır
	function updatePos() {
		if (!anchor || !tooltip) return;
		const rect = anchor.getBoundingClientRect();
		const t = tooltip;
		const scroll = { x: window.scrollX, y: window.scrollY };

		const positions = {
			top: {
				top: rect.top + scroll.y - t.offsetHeight - 8,
				left: rect.left + scroll.x + rect.width / 2 - t.offsetWidth / 2
			},
			bottom: {
				top: rect.bottom + scroll.y + 8,
				left: rect.left + scroll.x + rect.width / 2 - t.offsetWidth / 2
			},
			left: {
				top: rect.top + scroll.y + rect.height / 2 - t.offsetHeight / 2,
				left: rect.left + scroll.x - t.offsetWidth - 8
			},
			right: {
				top: rect.top + scroll.y + rect.height / 2 - t.offsetHeight / 2,
				left: rect.right + scroll.x + 8
			}
		};

		const pos = positions[position];
		t.style.top = pos.top + 'px';
		t.style.left = pos.left + 'px';
	}
</script>

<!-- Trigger -->
<span bind:this={anchor} class="tooltip-wrap" on:mouseenter={show} on:mouseleave={hide}>
	<slot />
</span>

<!-- Portal: body'e render edilir -->
{#if text}
	<div
		bind:this={tooltip}
		class="tooltip-portal {position}"
		class:visible
		on:mouseenter={show}
		on:mouseleave={hide}
		style="position:fixed; z-index:9999;"
	>
		{text}
	</div>
{/if}

<style>
	.tooltip-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.tooltip-portal {
		position: fixed;
		z-index: 9999;
		background: linear-gradient(135deg, #f5365c, #c4183c);
		color: #fff;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 6px 12px;
		border-radius: 8px;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 4px 14px rgba(245, 54, 92, 0.35);
		opacity: 0;
		transition: opacity 150ms ease;
	}

	.tooltip-portal.visible {
		opacity: 1;
		pointer-events: auto;
	}

	/* Oklar */
	.tooltip-portal::after {
		content: '';
		position: absolute;
		border: 5px solid transparent;
	}
	.tooltip-portal.top::after {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-top-color: #c4183c;
	}
	.tooltip-portal.bottom::after {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-bottom-color: #f5365c;
	}
	.tooltip-portal.left::after {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-left-color: #c4183c;
	}
	.tooltip-portal.right::after {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-right-color: #f5365c;
	}
</style>
