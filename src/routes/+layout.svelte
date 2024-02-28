<script>
	import { themeChange } from "theme-change";
	import { onMount } from "svelte";
	import "../app.css";

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="p-2 max-w-5xl mx-auto w-full">
	<slot />
</div>
