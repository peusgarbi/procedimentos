<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import { DateTime } from "luxon";

	export let data: PageData;

	let message = $page.url.searchParams.get("message");
	$: if (message) {
		toast.success(message);
	}
</script>

<Toaster />
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
</div>
