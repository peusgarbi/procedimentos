<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { slide } from "svelte/transition";
	import type { PageData } from "./$types";
	import { UAParser } from "ua-parser-js";

	export let data: PageData;

	const { form, errors, message, delayed, enhance } = superForm(data.form, {
		delayMs: 100,
	});

	let userAgent = UAParser(data.userAgent);
</script>

<main>
	<form method="POST" class="w-full max-w-xl mx-auto flex flex-col gap-4" use:enhance>
		<div class="daisy-card w-full bg-base-100 shadow-xl">
			<div class="daisy-card-body">
				<h2 class="daisy-card-title">Login</h2>
				<p>Digite sua senha:</p>

				<label class="daisy-input daisy-input-bordered flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="w-4 h-4 opacity-70"
						><path
							d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
						/><path
							d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
						/></svg
					>
					<input
						type="text"
						name="email"
						class="grow"
						placeholder="Email"
						bind:value={$form.email}
					/>
				</label>
				{#if $errors.email}
					<p transition:slide class="text-red-400 text-center">{$errors.email}</p>
				{/if}

				<label class="daisy-input daisy-input-bordered flex items-center gap-2 grow">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="w-4 h-4 opacity-70"
						><path
							fill-rule="evenodd"
							d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
							clip-rule="evenodd"
						/></svg
					>
					<input
						name="password"
						type="password"
						class="grow"
						placeholder="Senha"
						bind:value={$form.password}
					/>
				</label>
				{#if $errors.password}
					<p transition:slide class="text-red-400 text-center">{$errors.password}</p>
				{/if}

				<div class="daisy-card-actions justify-end">
					{#if $delayed}
						<button class="daisy-btn daisy-btn-square">
							<span class="daisy-loading daisy-loading-spinner"></span>
						</button>
					{:else}
						<button type="submit" class="daisy-btn daisy-btn-primary">Login</button>
					{/if}
				</div>

				<div class="prose">
					<ul>
						<li>
							<span class="font-semibold">Navegador: </span>{userAgent.browser.name}
							{userAgent.browser.version}
						</li>
						<li>
							<span class="font-semibold">CPU Arquitetura: </span>{userAgent.cpu.architecture}
						</li>
						<li>
							<span class="font-semibold">Motor: </span>{userAgent.engine.name}
							{userAgent.engine.version}
						</li>
						<li>
							<span class="font-semibold">Sistema Operacional: </span>{userAgent.os.name}
							{userAgent.os.version}
						</li>
					</ul>
					{#if $message}
						<div transition:slide role="alert" class="daisy-alert daisy-alert-error w-fit mx-auto">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
							<span>{$message.text}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</form>
</main>
