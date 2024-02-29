<script lang="ts">
	export let size: number = 800;
	export let color: "black" | "green" = "black";
</script>

<svg
	width={size}
	height={size}
	class={color}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d="M4 12.6111L8.92308 17.5L20 6.5"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

<style>
	.green {
		stroke: rgb(41, 156, 41);
	}
	.black {
		stroke: #000000;
	}
</style>
