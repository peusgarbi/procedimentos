<script lang="ts">
	type Button = {
		label: string;
		href: string;
	};

	const buttons: Button[] = [
		{ label: "Bater Ponto", href: "/ponto" },
		{ label: "Registrar Procedimento", href: "/procedures" },
		{ label: "Meus Registros", href: "/users/@me/surgeries" },
		{ label: "Mudar senha", href: "/users/@me/change-password" },
	];
</script>

<main>
	<div class="h-full p-10 rounded-lg bg-base-200 drop-shadow-md">
		<div class="text-center daisy-hero-content">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Seja bem-vindo(a)!</h1>
				<p class="py-6">Aproveite os sistemas para ajudar sua vida!</p>
				<div class="flex flex-wrap items-center justify-center gap-4">
					{#each buttons as button}
						<a href={button.href} class="daisy-btn daisy-btn-primary">{button.label}</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
