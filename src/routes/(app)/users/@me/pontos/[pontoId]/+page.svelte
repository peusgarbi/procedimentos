<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import { DateTime } from "luxon";

	export let data: PageData;

	const { form, errors, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});
</script>

<main>
	<form
		method="POST"
		enctype="multipart/form-data"
		class="flex flex-col w-full max-w-xl gap-4 mx-auto"
		use:enhance
	>
		<div class="w-full rounded-lg shadow-xl bg-base-100">
			<div class="daisy-card-body">
				<h2 class="daisy-card-title">Editar ponto</h2>

				<label for="type">Tipo de ponto</label>
				<select name="type" class="daisy-input daisy-input-bordered" bind:value={$form.type}>
					<option value="WORK">Trabalho</option>
				</select>
				{#if $errors.type}
					<p transition:slide class="text-center text-red-400">{$errors.type}</p>
				{/if}

				<label for="startTime"
					>Horário de início: <span class="font-semibold"
						>{DateTime.fromJSDate($form.entryTimestamp, { zone: "America/Sao_Paulo" })
							.setLocale("pt-BR")
							.toFormat("dd/MM/yyyy - HH:mm:ss")}</span
					></label
				>
				<input
					type="datetime-local"
					name="entryTimestamp"
					bind:value={$form.entryTimestamp}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.entryTimestamp}
					<p transition:slide class="text-center text-red-400">{$errors.entryTimestamp}</p>
				{/if}

				{#if $form.exitTimestamp}
					<label for="exitTimestamp"
						>Horário de término: <span class="font-semibold"
							>{DateTime.fromJSDate($form.exitTimestamp, { zone: "America/Sao_Paulo" })
								.setLocale("pt-BR")
								.toFormat("dd/MM/yyyy - HH:mm:ss")}</span
						></label
					>
				{:else}
					<label for="exitTimestamp"
						>Horário de término: <span class="font-semibold">Não informado</span></label
					>
				{/if}
				<input
					type="datetime-local"
					name="exitTimestamp"
					bind:value={$form.exitTimestamp}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.exitTimestamp}
					<p transition:slide class="text-center text-red-400">{$errors.exitTimestamp}</p>
				{/if}

				<div class="justify-end daisy-card-actions">
					{#if $delayed}
						<button class="daisy-btn daisy-btn-square">
							<span class="daisy-loading daisy-loading-spinner"></span>
						</button>
					{:else}
						<button type="submit" class="daisy-btn daisy-btn-primary">Editar!</button>
					{/if}
				</div>
			</div>
		</div>
	</form>
</main>
