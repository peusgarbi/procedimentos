<script lang="ts">
	import { superForm } from "sveltekit-superforms/client";
	import Check from "$lib/components/Check.svelte";
	import { fade, slide } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { form, message, errors, delayed, enhance } = superForm(data.form, {
		taintedMessage: false,
		delayMs: 100,
	});

	type PasswordRequirement = {
		description: string;
		regex: RegExp;
	};

	const passwordRequirements: PasswordRequirement[] = [
		{ description: "Deve conter pelo menos uma letra minúscula", regex: /^(?=.*[a-z]).*$/ },
		{ description: "Deve conter pelo menos uma letra maiúscula", regex: /^(?=.*[A-Z]).*$/ },
		{ description: "Deve conter pelo menos um dígito (0-9)", regex: /^(?=.*[0-9]).*$/ },
		{
			description: "Deve conter pelo menos um caractere especial ou não alfanumérico",
			regex: /^(?=.*[^\w\s]).*$/,
		},
		{ description: "Deve ter um comprimento entre 6 e 40 caracteres", regex: /^.{6,40}$/ },
	];
</script>

<main class="mx-auto">
	<div class="w-full max-w-sm mx-auto lg:w-96">
		<div>
			<h2 class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">Mudar senha</h2>
			<p class="mt-2 text-sm leading-6 text-gray-500">
				Preencha os campos abaixo seguindo as instruções
			</p>
		</div>

		<div class="mt-10">
			<div>
				{#if $message && $message.type === "success"}
					<div
						transition:slide={{ delay: 500, easing: cubicInOut }}
						class="relative flex p-4 transition-all rounded-lg group gap-x-6 hover:bg-gray-50"
					>
						<div
							class="flex items-center justify-center flex-none mt-1 transition-all bg-green-100 rounded-lg h-11 w-11 group-hover:bg-green-200"
						>
							<Check size={30} color="green" />
						</div>
						<div>
							<p class="font-semibold text-gray-900">
								Sucesso!
								<span class="absolute inset-0"></span>
							</p>
							<p class="mt-1 text-gray-600">
								{$message.text}
							</p>
						</div>
					</div>
				{:else}
					<form
						transition:slide={{ easing: cubicInOut }}
						method="POST"
						class="space-y-6"
						use:enhance
					>
						<div>
							<label for="currentPassword" class="block text-sm font-medium leading-6 text-gray-900"
								>Senha Atual</label
							>
							<div class="mt-2">
								<input
									bind:value={$form.currentPassword}
									id="currentPassword"
									name="currentPassword"
									type="password"
									class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 px-4 focus-visible:outline-none"
								/>
								{#if $errors.currentPassword}
									<p
										transition:slide={{ easing: cubicInOut }}
										class="w-full text-center text-red-400"
									>
										{$errors.currentPassword}
									</p>
								{/if}
							</div>
						</div>

						<div>
							<label for="newPassword" class="block text-sm font-medium leading-6 text-gray-900"
								>Nova Senha</label
							>
							<div class="mt-2">
								<input
									bind:value={$form.newPassword}
									id="newPassword"
									name="newPassword"
									type="password"
									class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 px-4 focus-visible:outline-none"
								/>
								{#if $errors.newPassword}
									<p
										transition:slide={{ easing: cubicInOut }}
										class="w-full text-center text-red-400"
									>
										{$errors.newPassword}
									</p>
								{/if}
							</div>
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900"
								>Confirmar senha</label
							>
							<div class="mt-2">
								<input
									bind:value={$form.confirmPassword}
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 px-4 focus-visible:outline-none"
								/>
								{#if $errors.confirmPassword}
									<p
										transition:slide={{ easing: cubicInOut }}
										class="w-full text-center text-red-400"
									>
										{$errors.confirmPassword.join(", ")}
									</p>
								{/if}
							</div>
						</div>

						<div class="flex flex-col items-center justify-center gap-6">
							<button
								disabled={$delayed}
								type="submit"
								class="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all disabled:bg-red-400"
								>Mudar!</button
							>
						</div>
						{#if $delayed}
							<div
								transition:slide={{}}
								class="flex flex-row items-center justify-center w-full h-full"
							>
								<span class="daisy-loading daisy-loading-spinner daisy-loading-lg"></span>
							</div>
						{/if}
						{#if $message && $message.type === "error"}
							<p transition:slide={{ easing: cubicInOut }} class="w-full text-center text-red-400">
								{$message.text}
							</p>
						{/if}
					</form>
				{/if}
				<div class="flex flex-row items-center justify-center mt-6">
					<a
						href="/"
						class="text-sm font-semibold text-gray-900 transition-all hover:-translate-y-1"
						><span aria-hidden="true">&larr;</span> Voltar</a
					>
				</div>
			</div>

			{#if !$delayed && $message?.type !== "success"}
				<div transition:fade class="mt-10">
					<div class="relative">
						<div class="absolute inset-0 flex items-center" aria-hidden="true">
							<div class="w-full border-t border-gray-200" />
						</div>
					</div>
				</div>
				<ul transition:slide={{ easing: cubicInOut }} role="list" class="px-4 py-6 space-y-6">
					{#each passwordRequirements as requirement, i}
						<li class="relative flex gap-x-4">
							{#if i + 1 < passwordRequirements.length}
								<div class="absolute top-0 left-0 flex justify-center w-6 -bottom-6">
									<div class="w-px bg-gray-200"></div>
								</div>
							{/if}
							<div class="relative flex items-center justify-center flex-none w-6 h-6 bg-white">
								{#if !requirement.regex.test($form.newPassword)}
									<div
										in:fade={{ delay: 500 }}
										out:fade={{}}
										class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"
									></div>
								{:else}
									<svg
										in:fade={{ delay: 500 }}
										out:fade={{}}
										class="w-6 h-6 text-green-600"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
							</div>
							<p class="flex-auto py-0.5 text-xs leading-5 text-gray-500">
								{requirement.description}
							</p>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</main>
