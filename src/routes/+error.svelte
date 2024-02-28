<script lang="ts">
	import { page } from "$app/stores";
</script>

<main>
	<div class="daisy-hero h-screen bg-base-200 rounded-lg drop-shadow-md p-10">
		<div class="daisy-hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Erro <span>{$page.status.toString()}</span>!</h1>
				<p class="py-6">{$page.error?.message}</p>
				<form method="POST">
					<a href="/" class="daisy-btn daisy-btn-primary">Home</a>
					<button type="submit" formaction="/auth/logout" class="daisy-btn daisy-btn-primary"
						>Logout</button
					>
				</form>
			</div>
		</div>
	</div>
</main>
