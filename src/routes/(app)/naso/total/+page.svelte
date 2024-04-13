<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<main class="flex flex-col gap-4">
	<div class="w-full max-w-4xl mx-auto rounded-lg shadow-xl bg-base-100">
		<div class="daisy-card-body">
			<h2 class="mx-auto text-3xl daisy-card-title">Sala da Naso - Total</h2>
			<div class="shadow daisy-stats">
				<div class="daisy-stat">
					<div class="daisy-stat-title">Total Naso</div>
					<div class="daisy-stat-value">{data.totalNaso}</div>
				</div>

				<div class="daisy-stat">
					<div class="daisy-stat-title">Total Nasolaringe</div>
					<div class="daisy-stat-value">{data.totalNasolaringe}</div>
				</div>

				<div class="daisy-stat">
					<div class="daisy-stat-title">Total Estrobo</div>
					<div class="daisy-stat-value">{data.totalEstrobo}</div>
				</div>
				<div class="daisy-stat">
					<div class="daisy-stat-title">Total Otofibro</div>
					<div class="daisy-stat-value">{data.totalOtofibroscopia}</div>
				</div>
				<div class="daisy-stat">
					<div class="daisy-stat-title">Total Geral</div>
					<div class="daisy-stat-value">{data.totalGeral}</div>
				</div>
			</div>
		</div>
	</div>
</main>
