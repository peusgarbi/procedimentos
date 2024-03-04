<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { form, errors, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});
</script>

<main>
	<form method="POST" class="flex flex-col w-full gap-4 mx-auto" use:enhance>
		<div class="w-full rounded-lg shadow-xl bg-base-100">
			<div class="daisy-card-body">
				<h2 class="daisy-card-title">Criar Internação</h2>

				<label for="hospital">Hospital:</label>
				<textarea
					name="hospital"
					bind:value={$form.hospital}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.hospital}
					<p transition:slide class="text-center text-red-400">{$errors.hospital}</p>
				{/if}

				<label for="identification">Identificação:</label>
				<textarea
					name="identification"
					bind:value={$form.identification}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.identification}
					<p transition:slide class="text-center text-red-400">{$errors.identification}</p>
				{/if}

				<label for="responsableDoctor">Doutor Responsável:</label>
				<textarea
					name="responsableDoctor"
					bind:value={$form.responsableDoctor}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.responsableDoctor}
					<p transition:slide class="text-center text-red-400">{$errors.responsableDoctor}</p>
				{/if}

				<label for="bed">Leito:</label>
				<textarea
					name="bed"
					bind:value={$form.bed}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.bed}
					<p transition:slide class="text-center text-red-400">{$errors.bed}</p>
				{/if}

				<label for="medications">Medicações em uso:</label>
				<textarea
					name="medications"
					bind:value={$form.medications}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.medications}
					<p transition:slide class="text-center text-red-400">{$errors.medications}</p>
				{/if}

				<label for="diagnosticHypothesis">Hipótese Diagnóstica:</label>
				<textarea
					name="diagnosticHypothesis"
					bind:value={$form.diagnosticHypothesis}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.diagnosticHypothesis}
					<p transition:slide class="text-center text-red-400">{$errors.diagnosticHypothesis}</p>
				{/if}

				<label for="history">HPMA:</label>
				<textarea
					name="history"
					bind:value={$form.history}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.history}
					<p transition:slide class="text-center text-red-400">{$errors.history}</p>
				{/if}

				<label for="personalBackground">Antecedentes Pessoais:</label>
				<textarea
					name="personalBackground"
					bind:value={$form.personalBackground}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.personalBackground}
					<p transition:slide class="text-center text-red-400">{$errors.personalBackground}</p>
				{/if}

				<label for="proceduresPerformed">Procedimentos Realizados:</label>
				<textarea
					name="proceduresPerformed"
					bind:value={$form.proceduresPerformed}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.proceduresPerformed}
					<p transition:slide class="text-center text-red-400">{$errors.proceduresPerformed}</p>
				{/if}

				<label for="clinicalExamination">Exame físico:</label>
				<textarea
					name="clinicalExamination"
					bind:value={$form.clinicalExamination}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.clinicalExamination}
					<p transition:slide class="text-center text-red-400">{$errors.clinicalExamination}</p>
				{/if}

				<label for="imaging">Exames de imagem:</label>
				<textarea
					name="imaging"
					bind:value={$form.imaging}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.imaging}
					<p transition:slide class="text-center text-red-400">{$errors.imaging}</p>
				{/if}

				<label for="labs">Exames laboratoriais:</label>
				<textarea
					name="labs"
					bind:value={$form.labs}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.labs}
					<p transition:slide class="text-center text-red-400">{$errors.labs}</p>
				{/if}

				<label for="therapeuticPlan">Conduta:</label>
				<textarea
					name="therapeuticPlan"
					bind:value={$form.therapeuticPlan}
					class="w-full daisy-textarea daisy-textarea-bordered"
				/>
				{#if $errors.therapeuticPlan}
					<p transition:slide class="text-center text-red-400">{$errors.therapeuticPlan}</p>
				{/if}

				<p>Evoluções:</p>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each $form.evolutions as _, i}
					<label for="evolutions">E{i + 1}:</label>
					<textarea
						name="evolutions"
						bind:value={$form.evolutions[i]}
						class="w-full daisy-textarea daisy-textarea-bordered"
					/>
					{#if $errors.evolutions}
						<p transition:slide class="text-center text-red-400">{$errors.evolutions}</p>
					{/if}
				{/each}

				<div class="flex flex-row items-center justify-center gap-1">
					{#if $form.evolutions.length > 0}
						<button
							type="button"
							class="w-2 daisy-btn"
							on:click={() => {
								$form.evolutions.pop();
								$form.evolutions = $form.evolutions;
							}}>-</button
						>
					{/if}
					<button
						type="button"
						class="w-2 daisy-btn"
						on:click={() => ($form.evolutions = [...$form.evolutions, ""])}>+</button
					>
				</div>

				<div class="justify-end daisy-card-actions">
					<a href="/external-admissions" class="daisy-btn">Voltar</a>
					{#if $delayed}
						<button class="w-2 daisy-btn daisy-btn-square">
							<span class="daisy-loading daisy-loading-spinner"></span>
						</button>
					{:else}
						<button type="submit" class="daisy-btn daisy-btn-primary">Criar!</button>
					{/if}
				</div>
			</div>
		</div>
	</form>
</main>
