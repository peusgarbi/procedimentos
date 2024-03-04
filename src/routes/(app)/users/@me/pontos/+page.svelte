<script lang="ts">
	import TrashBinSvg from "$lib/components/svg/TrashBinSvg.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import EditSvg from "$lib/components/svg/EditSvg.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";

	import { DateTime } from "luxon";
	import { onMount } from "svelte";

	export let data: PageData;

	let messageParam = $page.url.searchParams.get("message");
	$: if (messageParam) {
		toast.success(messageParam);
	}

	let deleteModal: HTMLDialogElement;
	let modalInfo = data.pontos[0];

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
			<li>Tipo: <span class="font-semibold">{modalInfo.type}</span></li>
			<li>
				Entrada: <span class="font-semibold"
					>{DateTime.fromJSDate(modalInfo.entryTimestamp, { zone: "America/Sao_Paulo" })
						.setLocale("pt-BR")
						.toFormat("dd/MM/yyyy - HH:mm:ss")}</span
				>
			</li>
			<li>
				Saída: <span class="font-semibold">
					{#if modalInfo.exitTimestamp}
						{DateTime.fromJSDate(modalInfo.exitTimestamp, { zone: "America/Sao_Paulo" })
							.setLocale("pt-BR")
							.toFormat("dd/MM/yyyy - HH:mm:ss")}
					{:else}
						Não informada
					{/if}
				</span>
			</li>
		</ul>
		<div class="daisy-modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="daisy-btn">Cancelar</button>
			</form>
			<form method="POST" action="?/deletePonto&id={modalInfo._id}">
				<button class="daisy-btn daisy-btn-error">Deletar</button>
			</form>
		</div>
	</div>
</dialog>

<main class="mx-auto">
	<div class="overflow-x-auto">
		<table class="daisy-table">
			<thead>
				<tr>
					<th>Tipo</th>
					<th>Entrada</th>
					<th>Saída</th>
					<th>Opções</th>
				</tr>
			</thead>
			<tbody>
				{#each data.pontos as ponto}
					<tr>
						<th>{ponto.type}</th>
						<td
							>{DateTime.fromJSDate(ponto.entryTimestamp, { zone: "America/Sao_Paulo" })
								.setLocale("pt-BR")
								.toFormat("dd/MM/yyyy - HH:mm:ss")}</td
						>
						{#if ponto.exitTimestamp}
							<td
								>{DateTime.fromJSDate(ponto.exitTimestamp, { zone: "America/Sao_Paulo" })
									.setLocale("pt-BR")
									.toFormat("dd/MM/yyyy - HH:mm:ss")}</td
							>
						{:else}
							<td>Ainda não saiu</td>
						{/if}
						<td class="flex flex-row gap-1">
							<a href={`/users/@me/pontos/${ponto._id}`}>
								<EditSvg size={20} />
							</a>
							<button type="button" on:click={() => openDeleteModal(ponto)}>
								<TrashBinSvg size={20} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if data.page && data.per_page && data.totalCount && data.totalPages}
		<Pagination
			url={$page.url}
			page={data.page}
			per_page={data.per_page}
			totalPages={data.totalPages}
			totalCount={data.totalCount}
		></Pagination>
	{/if}
</main>
