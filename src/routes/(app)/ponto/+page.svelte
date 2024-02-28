<script lang="ts">
	import { DateTime, Interval } from "luxon";
	import type { PageData } from "./$types";
	import { onDestroy } from "svelte";

	export let data: PageData;

	const lastPonto = DateTime.fromJSDate(data.lastPonto.timestamp, {
		zone: "America/Sao_Paulo",
	}).setLocale("pt-BR");
	const now = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" });
	let duration = Interval.fromDateTimes(lastPonto, now).toDuration().rescale();

	const timer = setInterval(() => {
		duration = duration.plus({ seconds: 1 }).rescale();
	}, 1000);

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<main>
	<div class="w-full max-w-xl mx-auto bg-base-100 shadow-xl rounded-lg">
		<div class="daisy-card-body">
			<h2 class="text-3xl daisy-card-title">Bater Ponto!</h2>
			<div class="prose">
				<ul>
					<li>
						<span class="font-semibold">Seu último ponto: </span>
						{#if data.firstTimeUsingPonto}
							Você nunca bateu ponto!
						{:else}
							{lastPonto.toFormat("dd/MM/yyyy - hh:mm:ss")}
						{/if}
					</li>
					{#if !data.firstTimeUsingPonto}
						<li>
							<span>Tipo: </span>
							{#if data.lastPonto?.type === "IN"}
								<span class="text-yellow-400">Entrou</span>
							{:else}
								<span class="text-green-400">Saiu</span>
							{/if}
						</li>
					{/if}
				</ul>
			</div>

			{#if !data.firstTimeUsingPonto}
				{#if data.lastPonto.type === "IN"}
					<p>Você está <span class="text-yellow-400">trabalhando</span> há:</p>
				{:else}
					<p>Você está <span class="text-green-400">descansando</span> há:</p>
				{/if}
				<div class="flex gap-5">
					<div>
						<span class="daisy-countdown font-mono text-4xl">
							<span style="--value:{duration.days};"></span>
						</span>
						dias
					</div>
					<div>
						<span class="daisy-countdown font-mono text-4xl">
							<span style="--value:{duration.hours};"></span>
						</span>
						horas
					</div>
					<div>
						<span class="daisy-countdown font-mono text-4xl">
							<span style="--value:{duration.minutes};"></span>
						</span>
						minutos
					</div>
					<div>
						<span class="daisy-countdown font-mono text-4xl">
							<span style="--value:{duration.seconds};"></span>
						</span>
						segundos
					</div>
				</div>
			{/if}

			<form method="POST" class="daisy-card-actions justify-end">
				{#if data.lastPonto?.type === "IN"}
					<button type="submit" class="daisy-btn daisy-btn-success">Descansar!</button>
				{:else}
					<button type="submit" class="daisy-btn daisy-btn-warning">Trabalhar!</button>
				{/if}
			</form>
		</div>
	</div>
</main>
