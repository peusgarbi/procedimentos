<script lang="ts">
	import Pagination from "$lib/components/Pagination.svelte";
	import EditSvg from "$lib/components/svg/EditSvg.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";

	import { DateTime } from "luxon";

	export let data: PageData;

	let messageParam = $page.url.searchParams.get("message");
	$: if (messageParam) {
		toast.success(messageParam);
	}
</script>

<Toaster />
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
						<td>
							<a href={`/users/@me/pontos/${ponto._id}`}>
								<EditSvg size={20} />
							</a>
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
