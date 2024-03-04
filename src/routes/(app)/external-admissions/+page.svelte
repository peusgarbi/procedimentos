<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import CopySvg from "$lib/components/svg/CopySvg.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import { superForm } from "sveltekit-superforms";
	import { invalidateAll } from "$app/navigation";
	import { Duration } from "luxon";
	import type { PageData } from "./$types";
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";

	export let data: PageData;

	const { form, enhance } = superForm(data.queryForm, {
		delayMs: 100,
	});

	let messageParam = $page.url.searchParams.get("message");
	$: if (messageParam) {
		toast.success(messageParam);
	}

	let isUpdating: boolean = false;
	let duration = Duration.fromObject({ seconds: 60 });
	const timer = setInterval(async () => {
		duration = duration.minus({ seconds: 1 }).rescale();
		if (duration.seconds < 1) {
			isUpdating = true;
			await invalidateAll();
			duration = Duration.fromObject({ seconds: 60 });
			isUpdating = false;
		}
	}, 1000);

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Texto copiado para a clipboard");
		} catch (error) {
			toast.error("Falha ao tentar copiar para a clipboard");
		}
	}

	async function copyFormatterdCase(caseIndex: number): Promise<void> {
		const selectedCase = data.externalAdmissions[caseIndex];
		const formattedCase = `${selectedCase.hospital}
		${selectedCase.identification}
		${selectedCase.responsableDoctor}
		${selectedCase.bed}
		${selectedCase.medications}
		${selectedCase.diagnosticHypothesis}
		${selectedCase.history}
		${selectedCase.personalBackground}
		${selectedCase.proceduresPerformed}
		${selectedCase.clinicalExamination}
		${selectedCase.imaging}
		${selectedCase.labs}
		${selectedCase.therapeuticPlan}`;
		await copyToClipboard(formattedCase);
	}

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<Toaster />
<main class="flex flex-col gap-4 py-4 mx-auto">
	<h1 class="text-5xl font-bold text-center">Internações externas:</h1>
	<a href="/external-admissions/create" class="daisy-btn daisy-btn-primary">Criar Internação</a>
	<form
		use:enhance
		method="POST"
		action="?/makeQuery"
		class="flex flex-row items-center justify-center gap-2"
	>
		<input
			placeholder="Pesquisar..."
			type="text"
			name="query"
			class="daisy-input daisy-input-bordered grow"
			bind:value={$form.query}
		/>
		<select
			name="discharged"
			class="max-w-xs daisy-input daisy-input-bordered"
			bind:value={$form.discharged}
		>
			<option value="all">Todos</option>
			<option value="false">Internados</option>
			<option value="true">De alta</option>
		</select>
		<button class="max-w-xs daisy-btn daisy-btn-default">Filtrar</button>
	</form>

	{#each data.externalAdmissions as admission, caseIndex}
		<div class="daisy-collapse daisy-collapse-arrow bg-base-200">
			<input type="radio" name="admission-{caseIndex}" />
			<div class="text-xl font-medium daisy-collapse-title">
				{admission.hospital} - {admission.identification}
				{#if admission.discharged}
					<div class="gap-2 mx-auto daisy-badge daisy-badge-success">Foi de alta!</div>
				{:else}
					<div class="gap-2 mx-auto daisy-badge daisy-badge-warning">Internado</div>
				{/if}
			</div>
			<div class="daisy-collapse-content">
				<div>
					<ul class="flex flex-col gap-1">
						<li>
							<span class="font-semibold"
								>Hospital:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.hospital)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.hospital}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Identificação:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.identification)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.identification}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Doutor responsável:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.responsableDoctor)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.responsableDoctor}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Leito:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.bed)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.bed}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Medicações em uso:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.medications)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.medications}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Hipótese Diagnóstica:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.diagnosticHypothesis)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.diagnosticHypothesis}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>HPMA:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.history)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.history}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>AP:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.personalBackground)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.personalBackground}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Procedimentos realizados:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.proceduresPerformed)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.proceduresPerformed}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>EF:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.clinicalExamination)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.clinicalExamination}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Exames de imagem:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.imaging)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.imaging}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Exames laboratoriais:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.labs)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.labs}
						</li>
						<hr />
						<li>
							<span class="font-semibold"
								>Conduta:<button
									type="button"
									class="transition-transform hover:scale-110"
									on:click={async () => await copyToClipboard(admission.therapeuticPlan)}
									><CopySvg size={20} /></button
								><br /></span
							>{admission.therapeuticPlan}
						</li>
						{#if admission.evolutions && admission.evolutions.length > 0}
							{#each admission.evolutions as evolution, i}
								<hr />
								<li>
									<span class="font-semibold"
										>Evolução {i + 1}:<button
											type="button"
											class="transition-transform hover:scale-110"
											on:click={async () => await copyToClipboard(evolution)}
											><CopySvg size={20} /></button
										><br /></span
									>{evolution}
								</li>
							{/each}
						{/if}
					</ul>
					<form
						action="?/discharge&id={admission._id}"
						method="POST"
						class="flex flex-wrap items-center justify-center gap-2"
					>
						<button
							type="button"
							class="w-28 daisy-btn daisy-btn-primary"
							on:click={async () => await copyFormatterdCase(caseIndex)}
							>Copiar caso formatado</button
						>
						<a
							href="/external-admissions/{admission._id}"
							class="w-28 daisy-btn daisy-btn-secondary">Editar internação</a
						>
						{#if admission.discharged}
							<button type="submit" class="w-28 daisy-btn daisy-btn-warning"
								>Readmitir paciente</button
							>
						{:else}
							<button type="submit" class="w-28 daisy-btn daisy-btn-success">Dar alta</button>
						{/if}
					</form>
				</div>
			</div>
		</div>
	{/each}
	{#if data.page && data.per_page && data.totalCount && data.totalPages}
		<Pagination
			url={$page.url}
			page={data.page}
			per_page={data.per_page}
			totalPages={data.totalPages}
			totalCount={data.totalCount}
		></Pagination>
	{/if}
	<div class="flex gap-5 ml-auto text-sm">
		{#if isUpdating}
			<div>Atualizando dados...</div>
		{:else}
			<div>
				Dados serão atualizados em
				<span class="font-mono daisy-countdown">
					<span style="--value:{duration.seconds};"></span>
				</span>
				{duration.seconds === 1 ? "segundo" : "segundos"}
			</div>
		{/if}
	</div>
</main>
