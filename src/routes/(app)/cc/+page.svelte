<script lang="ts">
	import { weDoAllSurgeons, weOnlyDoDescriptionsSurgeons } from "$lib/constants/surgeons";
	import type { ParsedProcedures } from "$lib/server/parser/procedureParser";
	import CopySvg from "$lib/components/svg/CopySvg.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import axios from "axios";

	export let data: PageData;

	let dateInput: string = data.date;

	const {
		form: sForm,
		errors,
		delayed,
	} = superForm(data.form, {
		delayMs: 100,
	});

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Texto copiado para a clipboard");
		} catch (error) {
			toast.error("Falha ao tentar copiar para a clipboard");
		}
	}

	function submitForm() {
		const formulario = document.getElementById("selectDateForm") as HTMLFormElement;
		formulario.submit();
	}

	async function parseProcedures(procedures: string): Promise<void> {
		const { data } = await axios.post<ParsedProcedures>("/api/procedures", { procedures });
		console.log(data);
	}
</script>

<Toaster />
<main class="flex flex-col gap-4">
	<form
		class="flex flex-row items-center justify-center gap-4"
		enctype="multipart/form-data"
		method="POST"
		action="?/processPdf"
	>
		<label class="flex items-center w-full max-w-3xl daisy-input daisy-input-bordered">
			<input
				type="file"
				name="ccPdf"
				class="grow"
				placeholder="Buscar..."
				accept="application/pdf"
				bind:value={$sForm.ccPdf}
			/>
		</label>
		<button type="submit" class="daisy-btn daisy-btn-primary">Processar</button>
		{#if $delayed}
			<div class="flex flex-row items-center justify-center pt-2">
				<span transition:slide class="daisy-loading daisy-loading-ring daisy-loading-lg"></span>
			</div>
		{/if}
		{#if $errors.ccPdf}
			<p class="text-red-400">{$errors.ccPdf}</p>
		{/if}
	</form>
	<form
		id="selectDateForm"
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
			on:change={submitForm}
		/>
	</form>

	{#if data.parsedCc}
		<h1 class="text-3xl font-bold text-center">{data.parsedCc.date}</h1>
		{#each data.parsedCc.salas as cirurgias}
			<div class="overflow-x-auto">
				<h2 class="text-xl font-semibold">{cirurgias[0].sala}</h2>
				<table class="daisy-table daisy-table-zebra daisy-table-xs">
					<thead>
						<tr>
							<th>Horário</th>
							<th>Paciente</th>
							<th>Cirurgião</th>
							<th>Idade</th>
							<th>Nascimento</th>
							<th>Acomodação</th>
							<th>Convênio</th>
							<th>Serviços</th>
							<th>Opções</th>
						</tr>
					</thead>
					<tbody>
						{#each cirurgias as surgery}
							{#if weDoAllSurgeons.includes(surgery.cirurgiao)}
								<tr class="text-green-600">
									<th>{surgery.horario}</th>
									<td class="flex flex-row"
										>{surgery.paciente}<button
											type="button"
											class="transition-transform hover:scale-110"
											on:click={async () => await copyToClipboard(surgery.paciente)}
											><CopySvg size={15} /></button
										></td
									>
									<td>{surgery.cirurgiao}</td>
									<td>{surgery.idade}</td>
									<td>{surgery.nascimento}</td>
									<td>{surgery.acomodacao}</td>
									<td>{surgery.convenio}</td>
									<td>{surgery.servicos}</td>
									<td class="flex flex-row gap-1">
										<button type="button" on:click={() => parseProcedures(surgery.servicos)}
											>PP</button
										>
									</td>
								</tr>
							{:else if weOnlyDoDescriptionsSurgeons.includes(surgery.cirurgiao)}
								<tr class="text-yellow-500">
									<th>{surgery.horario}</th>
									<td class="flex flex-row"
										>{surgery.paciente}<button
											type="button"
											class="transition-transform hover:scale-110"
											on:click={async () => await copyToClipboard(surgery.paciente)}
											><CopySvg size={15} /></button
										></td
									>
									<td>{surgery.cirurgiao}</td>
									<td>{surgery.idade}</td>
									<td>{surgery.nascimento}</td>
									<td>{surgery.acomodacao}</td>
									<td>{surgery.convenio}</td>
									<td>{surgery.servicos}</td>
									<td class="flex flex-row gap-1">
										<button type="button" on:click={() => parseProcedures(surgery.servicos)}
											>PP</button
										>
									</td>
								</tr>
							{:else}
								<tr class="text-red-500">
									<th>{surgery.horario}</th>
									<td class="flex flex-row"
										>{surgery.paciente}<button
											type="button"
											class="transition-transform hover:scale-110"
											on:click={async () => await copyToClipboard(surgery.paciente)}
											><CopySvg size={15} /></button
										></td
									>
									<td>{surgery.cirurgiao}</td>
									<td>{surgery.idade}</td>
									<td>{surgery.nascimento}</td>
									<td>{surgery.acomodacao}</td>
									<td>{surgery.convenio}</td>
									<td>{surgery.servicos}</td>
									<td class="flex flex-row gap-1">
										<button type="button" on:click={() => parseProcedures(surgery.servicos)}
											>PP</button
										>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	{/if}
</main>
