<script lang="ts">
	import type { PageData } from "./$types";
	import { DateTime } from "luxon";

	export let data: PageData;

	let dateInput: string = data.date;

	const tryedDate = DateTime.fromFormat(data.date, "yyyy-MM-dd", {
		locale: "pt-BR",
		zone: "America/Sao_Paulo",
	});
</script>

<main class="flex flex-col gap-4">
	<div class="w-full max-w-4xl mx-auto rounded-lg shadow-xl bg-base-100">
		<div class="daisy-card-body">
			<h2 class="text-3xl daisy-card-title">Sala da Naso - {tryedDate.toFormat("dd/MM/yyyy")}</h2>
			<form
				method="POST"
				action="?/selectDate"
				class="flex flex-row items-center justify-center gap-4"
			>
				<input
					type="date"
					name="dateInput"
					placeholder="Selecionar data"
					class="w-full max-w-xs daisy-input daisy-input-bordered"
					bind:value={dateInput}
				/>
				<button type="submit" class="daisy-btn daisy-btn-primary">Mudar Data</button>
			</form>
			<div class="shadow daisy-stats">
				<div class="daisy-stat">
					<div class="daisy-stat-figure text-secondary">
						<form method="POST">
							{#if data.nasos.naso > 0}
								<button
									formaction="?/decrementNaso&date={data.date}"
									class="daisy-btn daisy-btn-circle"
								>
									-
								</button>
							{/if}
							<button
								formaction="?/incrementNaso&date={data.date}"
								class="daisy-btn daisy-btn-circle daisy-btn-outline"
							>
								+
							</button>
						</form>
					</div>
					<div class="daisy-stat-title">Naso</div>
					<div class="daisy-stat-value">{data.nasos.naso}</div>
				</div>

				<div class="daisy-stat">
					<div class="daisy-stat-figure text-secondary">
						<form method="POST">
							{#if data.nasos.nasoLaringe > 0}
								<button
									formaction="?/decrementNasoLaringe&date={data.date}"
									class="daisy-btn daisy-btn-circle"
								>
									-
								</button>
							{/if}
							<button
								formaction="?/incrementNasoLaringe&date={data.date}"
								class="daisy-btn daisy-btn-circle daisy-btn-outline"
							>
								+
							</button>
						</form>
					</div>
					<div class="daisy-stat-title">Nasolaringe</div>
					<div class="daisy-stat-value">{data.nasos.nasoLaringe}</div>
				</div>

				<div class="daisy-stat">
					<div class="daisy-stat-figure text-secondary">
						<form method="POST">
							{#if data.nasos.estrobo > 0}
								<button
									formaction="?/decrementEstrobo&date={data.date}"
									class="daisy-btn daisy-btn-circle"
								>
									-
								</button>
							{/if}
							<button
								formaction="?/incrementEstrobo&date={data.date}"
								class="daisy-btn daisy-btn-circle daisy-btn-outline"
							>
								+
							</button>
						</form>
					</div>
					<div class="daisy-stat-title">Estrobo</div>
					<div class="daisy-stat-value">{data.nasos.estrobo}</div>
				</div>
			</div>
		</div>
	</div>
</main>
