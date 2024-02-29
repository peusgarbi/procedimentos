<script lang="ts">
	import { DateTime, Duration, Interval } from "luxon";
	import type { PageData } from "./$types";
	import { onDestroy } from "svelte";

	export let data: PageData;

	const lastPontoEntry = DateTime.fromJSDate(data.lastPonto?.entryTimestamp || new Date(), {
		zone: "America/Sao_Paulo",
	}).setLocale("pt-BR");
	const lastPontoExit = DateTime.fromJSDate(data.lastPonto?.exitTimestamp || new Date(), {
		zone: "America/Sao_Paulo",
	}).setLocale("pt-BR");
	const now = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" });
	let duration: Duration<true> | Duration<false>;
	if (data.lastPonto?.exitTimestamp) {
		duration = Interval.fromDateTimes(lastPontoExit, now).toDuration().rescale();
	} else {
		duration = Interval.fromDateTimes(lastPontoEntry, now).toDuration().rescale();
	}

	const timer = setInterval(() => {
		duration = duration.plus({ seconds: 1 }).rescale();
	}, 1000);

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<main>
	<div class="w-full max-w-xl mx-auto rounded-lg shadow-xl bg-base-100">
		<div class="daisy-card-body">
			<h2 class="text-3xl daisy-card-title">Bater Ponto!</h2>
			<div class="prose">
				<ul>
					<li>
						<span class="font-semibold">Seu último ponto: </span>
						{#if data.lastPonto?.exitTimestamp}
							{lastPontoExit.toFormat("dd/MM/yyyy - hh:mm:ss")}
						{:else if data.lastPonto?.entryTimestamp}
							{lastPontoEntry.toFormat("dd/MM/yyyy - hh:mm:ss")}
						{:else}
							Você nunca bateu ponto!
						{/if}
					</li>
					{#if data.lastPonto}
						<li>
							<span>Tipo: </span>
							{#if !data.lastPonto.exitTimestamp}
								<span class="text-yellow-400">Entrou</span>
							{:else}
								<span class="text-green-400">Saiu</span>
							{/if}
						</li>
					{/if}
				</ul>
			</div>

			{#if data.lastPonto}
				{#if !data.lastPonto.exitTimestamp}
					<p>Você está <span class="text-yellow-400">trabalhando</span> há:</p>
				{:else}
					<p>Você está <span class="text-green-400">descansando</span> há:</p>
				{/if}
				<div class="flex gap-5">
					<div>
						<span class="font-mono text-4xl daisy-countdown">
							<span style="--value:{duration.days};"></span>
						</span>
						dias
					</div>
					<div>
						<span class="font-mono text-4xl daisy-countdown">
							<span style="--value:{duration.hours};"></span>
						</span>
						horas
					</div>
					<div>
						<span class="font-mono text-4xl daisy-countdown">
							<span style="--value:{duration.minutes};"></span>
						</span>
						minutos
					</div>
					<div>
						<span class="font-mono text-4xl daisy-countdown">
							<span style="--value:{duration.seconds};"></span>
						</span>
						segundos
					</div>
				</div>
			{/if}

			<form method="POST" class="justify-end daisy-card-actions">
				{#if !data.lastPonto || data.lastPonto.exitTimestamp}
					<button type="submit" class="daisy-btn daisy-btn-warning">Trabalhar!</button>
				{:else}
					<button type="submit" class="daisy-btn daisy-btn-success">Descansar!</button>
				{/if}
			</form>
		</div>
	</div>
</main>
