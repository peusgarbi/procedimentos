<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import { DateTime } from "luxon";

	export let data: PageData;

	const { form, errors, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});

	let messageParam = $page.url.searchParams.get("message");
	$: if (messageParam) {
		toast.success(messageParam);
	}
</script>

<Toaster />
<main class="flex flex-col gap-4">
	<form method="POST" use:enhance>
		<label
			class="flex items-center w-full max-w-3xl gap-2 mx-auto daisy-input daisy-input-bordered"
		>
			<input
				type="text"
				name="query"
				class="grow"
				placeholder="Buscar..."
				bind:value={$form.query}
			/>
			<button type="submit">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="w-4 h-4 opacity-70"
					><path
						fill-rule="evenodd"
						d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
						clip-rule="evenodd"
					/></svg
				>
			</button>
		</label>
		{#if $errors.query}
			<p transition:slide class="pt-2 text-center text-red-400">{$errors.query}</p>
		{/if}
		{#if $delayed}
			<div class="flex flex-row items-center justify-center pt-2">
				<span transition:slide class="daisy-loading daisy-loading-ring daisy-loading-lg"></span>
			</div>
		{/if}
	</form>
	<div class="overflow-x-auto">
		<table class="daisy-table daisy-table-zebra daisy-table-xs">
			<thead>
				<tr>
					<th>Cirurgia</th>
					<th>Papel</th>
					<th>Diagnóstico</th>
					<th>Paciente</th>
					<th>Data</th>
				</tr>
			</thead>
			<tbody>
				{#each data.surgeries as surgery}
					<tr>
						<th>{surgery.surgeryType}</th>
						<td>{surgery.role}</td>
						<td>{surgery.diagnosis}</td>
						<td>{surgery.patient}</td>
						<td
							>{DateTime.fromJSDate(surgery.date, { zone: "America/Sao_Paulo" })
								.setLocale("pt-BR")
								.toFormat("dd/MM/yyyy - HH:mm:ss")}</td
						>
					</tr>
				{/each}
			</tbody>
			<!-- <tfoot>
				<tr>
					<th>Cirurgia</th>
					<th>company</th>
					<th>location</th>
					<th>Last Login</th>
					<th>Favorite Color</th>
				</tr>
			</tfoot> -->
		</table>
		{#if data.page && data.per_page && data.totalCount && data.totalPages}
			<Pagination
				url={$page.url}
				page={data.page}
				per_page={data.per_page}
				totalPages={data.totalPages}
				totalCount={data.totalCount}
			></Pagination>
		{/if}
	</div>
</main>
