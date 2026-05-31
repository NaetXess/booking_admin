<script>
	import { onMount } from 'svelte';

	export let alternativeDesign;
	//

	let cardBg = 'white';
	let textColor = 'black';

	onMount(() => {
		if (alternativeDesign) {
			cardBg = 'linear-gradient(15deg, rgba(37, 44, 56, 1) 0%, rgba(68, 84, 113, 1) 100%)';
			textColor = 'white';
		}
	});
</script>

<div class="t-card" style="background: {cardBg}; color: {textColor};">
	<slot />
</div>

<style>
	.t-card {
		position: relative;
		border-radius: 8px;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
		/* Overflow özelliğini tooltipler için kapattım */
		/* overflow: clip; */
	}
</style>
