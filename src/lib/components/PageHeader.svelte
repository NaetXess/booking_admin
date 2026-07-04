<script>
	import { goto } from '$app/navigation';
	import Button from '@components/Button.svelte';

	let { title, subTitle, url, btnTitle, onclick } = $props();
</script>

<div class="page-header">
	<div>
		<h5 class="page-title">{title}</h5>
		<p class="page-sub">{subTitle}</p>
	</div>
	<Button title={`+ ${btnTitle}`} primary on:click={url ? () => goto(url) : onclick} />
</div>

<style>
	/* ─── Header ─────────────────────────────────────────────── */
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 12px;
	}
	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: #252c38;
		margin: 0 0 2px 0;
	}
	.page-sub {
		font-size: 13px;
		color: #9aa3b0;
		margin: 0;
	}
</style>
