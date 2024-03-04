<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { form, errors, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});

	const priorities = [
		{ value: "LOW", label: "Baixa" },
		{ value: "MEDIUM", label: "Média" },
		{ value: "HIGH", label: "Alta" },
	];
</script>

<main>
	<form method="POST" class="flex flex-col w-full max-w-xl gap-4 mx-auto" use:enhance>
		<div class="w-full rounded-lg shadow-xl bg-base-100">
			<div class="daisy-card-body">
				<h2 class="daisy-card-title">Criar Tarefa</h2>

				<label for="name">Nome: <span class="text-red-600">*</span></label>
				<input
					type="text"
					name="name"
					bind:value={$form.name}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.name}
					<p transition:slide class="text-center text-red-400">{$errors.name}</p>
				{/if}

				<label for="description">Descrição: <span class="text-red-600">*</span></label>
				<textarea
					name="description"
					bind:value={$form.description}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.description}
					<p transition:slide class="text-center text-red-400">{$errors.description}</p>
				{/if}

				<label for="priority">Prioridade: <span class="text-red-600">*</span></label>
				<select
					name="priority"
					placeholder="Type here"
					class="w-full daisy-input daisy-input-bordered"
					bind:value={$form.priority}
				>
					{#each priorities as priority}
						<option value={priority.value}>{priority.label}</option>
					{/each}
				</select>
				{#if $errors.priority}
					<p transition:slide class="text-center text-red-400">{$errors.priority}</p>
				{/if}

				<label for="dueDate">Resolver até:</label>
				<input
					type="datetime-local"
					name="dueDate"
					bind:value={$form.dueDate}
					class="w-full daisy-input daisy-input-bordered"
				/>
				{#if $errors.dueDate}
					<p transition:slide class="text-center text-red-400">{$errors.dueDate}</p>
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
