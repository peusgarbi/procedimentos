<script>
	import { themeChange } from "theme-change";
	import { onMount } from "svelte";
	import "../app.css";

	onMount(() => {
		themeChange(false);
	});
</script>

<slot />
