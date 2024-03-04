<script lang="ts">
	import TrashBinSvg from "$lib/components/svg/TrashBinSvg.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import EditSvg from "$lib/components/svg/EditSvg.svelte";
	import Download from "$lib/components/Download.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import { superForm } from "sveltekit-superforms";
	import { DateTime, Duration } from "luxon";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	export let data: PageData;

	const { form, errors, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});

	let messageParam = $page.url.searchParams.get("message");
	$: if (messageParam) {
		toast.success(messageParam);
	}

	let deleteModal: HTMLDialogElement;
	let modalInfo = {
		_id: "",
		surgeryType: "",
		role: "",
		diagnosis: "",
		patient: "",
	};

	onMount(() => {
		deleteModal = document.getElementById("delete_modal") as HTMLDialogElement;
	});

	function openDeleteModal(data: typeof modalInfo) {
		modalInfo = data;
		deleteModal.showModal();
	}
</script>

<Toaster />

<dialog id="delete_modal" class="daisy-modal">
	<div class="prose daisy-modal-box">
		<h3 class="text-lg font-bold">Tem certeza que deseja deletar? Esta ação é irreversível!</h3>
		<span class="py-4 text-sm">Pressione ESC ou Cancelar para sair</span>
		<ul>
			<li>Id: <span class="font-semibold">{modalInfo._id}</span></li>
			<li>Tipo: <span class="font-semibold">{modalInfo.surgeryType}</span></li>
			<li>Papel: <span class="font-semibold">{modalInfo.role}</span></li>
			<li>Diagnóstico: <span class="font-semibold">{modalInfo.diagnosis}</span></li>
			<li>Paciente: <span class="font-semibold">{modalInfo.patient}</span></li>
		</ul>
		<div class="daisy-modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="daisy-btn">Cancelar</button>
			</form>
			<form method="POST" action="?/deleteSurgery&id={modalInfo._id}">
				<button class="daisy-btn daisy-btn-error">Deletar</button>
			</form>
		</div>
	</div>
</dialog>

<main class="flex flex-col gap-4">
	<form method="POST" action="?/makeQuery" use:enhance>
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
					<th>Início</th>
					<th>Término</th>
					<th>Duração</th>
					<th>Opções</th>
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
							>{DateTime.fromJSDate(surgery.startTime, { zone: "America/Sao_Paulo" })
								.setLocale("pt-BR")
								.toFormat("dd/MM/yyyy - HH:mm:ss")}</td
						>
						<td
							>{DateTime.fromJSDate(surgery.endTime, { zone: "America/Sao_Paulo" })
								.setLocale("pt-BR")
								.toFormat("dd/MM/yyyy - HH:mm:ss")}</td
						>
						<td
							>{Duration.fromObject({ seconds: surgery.durationInSeconds }).toFormat(
								"hh:mm:ss",
							)}</td
						>
						<td class="flex flex-row gap-1">
							{#if surgery.fileExtension}
								<a
									href={`/api/v1/file/${surgery._id}.${surgery.fileExtension}`}
									target="_blank"
									class="hover:-translate-y-[1px]"><Download size={20} /></a
								>
							{/if}
							<a href="/users/@me/surgeries/{surgery._id}">
								<EditSvg size={20} />
							</a>
							<button on:click={() => openDeleteModal(surgery)}>
								<TrashBinSvg size={20} />
							</button>
						</td>
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
