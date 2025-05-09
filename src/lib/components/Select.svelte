<script>
	export let classess;
	export let id;
	export let value;
	export let disabled;
</script>

<select on:change {disabled} bind:value class="form-select {classess}" {id}>
	<slot />
</select>
