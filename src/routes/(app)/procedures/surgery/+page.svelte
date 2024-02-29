<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import Select from "svelte-select";

	export let data: PageData;

	const { form, errors, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});

	type SurgeryItem = {
		value: string;
		label: string;
		group: "Bucofaringologia" | "CCP" | "Otologia" | "Rinologia" | "Outro";
	};

	const surgeryItems: SurgeryItem[] = [
		{ value: "Amigdalectomia", label: "Amigdalectomia", group: "Bucofaringologia" },
		{ value: "Adenoidectomia", label: "Adenoidectomia", group: "Bucofaringologia" },
		{
			value: "Amigdalectomia + Adenoidectomia",
			label: "Amigdalectomia + Adenoidectomia",
			group: "Bucofaringologia",
		},
		{ value: "Outro", label: "Outro", group: "Outro" },
	];

	const roles = [
		"Cirurgião",
		"Primeiro Auxiliar",
		"Segundo Auxiliar",
		"Instrumentador",
		"Observador",
		"Outro",
	];

	const groupBy = (item: SurgeryItem) => item.group;
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
				<h2 class="daisy-card-title">Registrar Cirurgia</h2>

				<label for="surgeryType">Qual foi a cirurgia realizada?</label>
				<Select
					items={surgeryItems}
					{groupBy}
					bind:justValue={$form.surgeryType}
					placeholder="Selecionar..."
				></Select>
				<input name="surgeryType" bind:value={$form.surgeryType} hidden />
				{#if $errors.surgeryType}
					<p transition:slide class="text-center text-red-400">{$errors.surgeryType}</p>
				{/if}

				{#if $form.surgeryType === "Outro"}
					<label for="otherSurgeryType">Outra, qual?</label>
					<input
						type="text"
						name="otherSurgeryType"
						bind:value={$form.otherSurgeryType}
						class="w-full daisy-input daisy-input-bordered"
					/>
					{#if $errors.otherSurgeryType}
						<p transition:slide class="text-center text-red-400">{$errors.otherSurgeryType}</p>
					{/if}
				{/if}

				<label for="role">Qual foi seu papel?</label>
				<Select items={roles} {groupBy} bind:justValue={$form.role} placeholder="Selecionar..."
				></Select>
				<input name="role" bind:value={$form.role} hidden />
				{#if $errors.role}
					<p transition:slide class="text-center text-red-400">{$errors.role}</p>
				{/if}

				{#if $form.role === "Outro"}
					<label for="otherRole">Outro, qual?</label>
					<input
						type="text"
						name="otherRole"
						bind:value={$form.otherRole}
						class="w-full daisy-input daisy-input-bordered"
					/>
					{#if $errors.otherRole}
						<p transition:slide class="text-center text-red-400">{$errors.otherRole}</p>
					{/if}
				{/if}

				<label for="patientInitials">Iniciais do Paciente</label>
				<input
					type="text"
					name="patientInitials"
					bind:value={$form.patientInitials}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.patientInitials}
					<p transition:slide class="text-center text-red-400">{$errors.patientInitials}</p>
				{/if}

				<label for="diagnosis">Diagnóstico</label>
				<input
					type="text"
					name="diagnosis"
					bind:value={$form.diagnosis}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.diagnosis}
					<p transition:slide class="text-center text-red-400">{$errors.diagnosis}</p>
				{/if}

				<label for="startTime">Horário de início</label>
				<input
					type="datetime-local"
					name="startTime"
					bind:value={$form.startTime}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.startTime}
					<p transition:slide class="text-center text-red-400">{$errors.startTime}</p>
				{/if}

				<label for="endTime">Horário de término</label>
				<input
					type="datetime-local"
					name="endTime"
					bind:value={$form.endTime}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.endTime}
					<p transition:slide class="text-center text-red-400">{$errors.endTime}</p>
				{/if}

				<label for="otherRole">Deseja anexar um arquivo de comprovação?</label>
				<input type="file" name="file" class="w-full daisy-file-input daisy-file-input-bordered" />
				{#if $errors.file}
					<p transition:slide class="text-center text-red-400">{$errors.file}</p>
				{/if}

				<div class="justify-end daisy-card-actions">
					{#if $delayed}
						<button class="daisy-btn daisy-btn-square">
							<span class="daisy-loading daisy-loading-spinner"></span>
						</button>
					{:else}
						<button type="submit" class="daisy-btn daisy-btn-primary">Registrar</button>
					{/if}
				</div>
			</div>
		</div>
	</form>
</main>
