<script>
	export let classes;
</script>

<div class="row {classes ? classes : ''}">
	<slot />
</div>
