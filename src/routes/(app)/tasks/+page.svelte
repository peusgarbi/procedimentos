<script lang="ts">
	import toast, { Toaster } from "svelte-french-toast";
	import { invalidateAll } from "$app/navigation";
	import { DateTime, Duration } from "luxon";
	import type { PageData } from "./$types";
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";

	export let data: PageData;

	let messageParam = $page.url.searchParams.get("message");
	$: if (messageParam) {
		toast.success(messageParam);
	}

	let completed: "all" | "true" | "false" | string = data.completed || "all";

	let isUpdating: boolean = false;
	let duration = Duration.fromObject({ seconds: 60 });
	const timer = setInterval(async () => {
		duration = duration.minus({ seconds: 1 }).rescale();
		if (duration.seconds < 1) {
			isUpdating = true;
			await invalidateAll();
			duration = Duration.fromObject({ seconds: 60 });
			isUpdating = false;
		}
	}, 1000);

	let currentFocusedTask: number = 0;
	function openTaskDescriptionDialog(taskIndex: number) {
		currentFocusedTask = taskIndex;
		const modal = document.getElementById("task_modal") as HTMLDialogElement;
		modal.showModal();
	}

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<Toaster />

<dialog id="task_modal" class="daisy-modal">
	<div class="prose daisy-modal-box">
		<h3 class="text-lg font-bold">Tem certeza que deseja deletar? Esta ação é irreversível!</h3>
		<span class="py-4 text-sm">Pressione ESC ou Cancelar para sair</span>
		<ul>
			<li>Id: <span class="font-semibold">{data.tasks[currentFocusedTask]._id}</span></li>
			<li>Nome: <span class="font-semibold">{data.tasks[currentFocusedTask].name}</span></li>
			<li>
				Descrição: <span class="font-semibold">{data.tasks[currentFocusedTask].description}</span>
			</li>
			<li>
				Prioridade:
				{#if data.tasks[currentFocusedTask].priority === "HIGH"}
					<span class="font-semibold text-red-600">Alta</span>
				{:else if data.tasks[currentFocusedTask].priority === "MEDIUM"}
					<span class="font-semibold text-yellow-600">Média</span>
				{:else if data.tasks[currentFocusedTask].priority === "LOW"}
					<span class="font-semibold text-green-600">Baixa</span>
				{/if}
			</li>
			<li>
				Criada em: <span class="font-semibold"
					>{DateTime.fromJSDate(data.tasks[currentFocusedTask].createdAt, {
						zone: "America/Sao_Paulo",
					})
						.setLocale("pt-BR")
						.toFormat("dd/MM/yyyy - HH:mm:ss")}</span
				>
			</li>
			<li>
				Resolver até: <span class="font-semibold">
					{#if data.tasks[currentFocusedTask].dueDate}
						{DateTime.fromJSDate(data.tasks[currentFocusedTask].dueDate || new Date(), {
							zone: "America/Sao_Paulo",
						})
							.setLocale("pt-BR")
							.toFormat("dd/MM/yyyy - HH:mm:ss")}
					{:else}
						Não cadastrado
					{/if}
				</span>
			</li>
			<li>
				Concluída em: <span class="font-semibold">
					{#if data.tasks[currentFocusedTask].completedAt}
						{DateTime.fromJSDate(data.tasks[currentFocusedTask].completedAt || new Date(), {
							zone: "America/Sao_Paulo",
						})
							.setLocale("pt-BR")
							.toFormat("dd/MM/yyyy - HH:mm:ss")}
					{:else}
						Não concluída
					{/if}
				</span>
			</li>
		</ul>
		<div class="daisy-modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="daisy-btn">Cancelar</button>
			</form>
		</div>
	</div>
</dialog>

<main class="flex flex-col gap-4 mx-auto">
	<div class="shadow-xl daisy-card grow bg-base-100">
		<div class="daisy-card-body">
			<h2 class="daisy-card-title">Tarefas</h2>
			<a href="/tasks/create" class="max-w-sm mx-auto daisy-btn daisy-btn-primary">Criar Tarefa!</a>
			<form
				method="POST"
				action="?/makeQuery&completed={completed}"
				class="flex flex-row items-center justify-end gap-2"
			>
				<select
					placeholder="Type here"
					class="max-w-xs daisy-input daisy-input-bordered"
					bind:value={completed}
				>
					<option value="all">Todas</option>
					<option value="false">Incompletas</option>
					<option value="true">Completas</option>
				</select>
				<button class="max-w-xs daisy-btn daisy-btn-default">Filtrar</button>
			</form>
			<div class="overflow-x-auto">
				<table class="daisy-table">
					<!-- head -->
					<thead>
						<tr>
							<th>Concluída?</th>
							<th>Nome</th>
							<th>Descrição</th>
							<th>Prioridade</th>
							<th>Resolver até</th>
							<th>Opções</th>
						</tr>
					</thead>
					<tbody>
						<!-- row 1 -->
						{#each data.tasks as task, taskIndex}
							<tr>
								<th>
									<label>
										<input
											type="checkbox"
											class="daisy-checkbox"
											checked={task.completedAt ? true : false}
											disabled
										/>
									</label>
								</th>
								<td>
									<button
										type="button"
										class="flex items-center gap-3"
										on:click={() => openTaskDescriptionDialog(taskIndex)}
									>
										<div>
											<div class="font-bold">{task.name}</div>
											<!-- <div class="text-sm opacity-50">Name description</div> -->
										</div>
									</button>
								</td>
								<td>
									{task.description}
									<br />
									<!-- <span class="daisy-badge daisy-badge-ghost daisy-badge-sm"
										>Description description</span
									> -->
								</td>
								<td>
									{#if task.priority === "HIGH"}
										<div class="gap-2 daisy-badge daisy-badge-error">↑ Alta</div>
									{:else if task.priority === "MEDIUM"}
										<div class="gap-2 daisy-badge daisy-badge-warning">→ Média</div>
									{:else if task.priority === "LOW"}
										<div class="gap-2 daisy-badge daisy-badge-success">↓ Baixa</div>
									{/if}
								</td>
								<td>
									{#if task.dueDate}
										{DateTime.fromJSDate(task.dueDate, { zone: "America/Sao_Paulo" })
											.setLocale("pt-BR")
											.toFormat("dd/MM/yyyy - HH:mm:ss")}
									{:else}
										Sem data definida
									{/if}
								</td>
								<td>
									<form method="POST" action="?/switchTaskState&taskId={task._id}">
										<button type="submit" class="daisy-btn daisy-btn-default daisy-btn-xs">
											{#if task.completedAt}
												Marcar como pendente
											{:else}
												Marcar como concluída
											{/if}
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="flex gap-5 ml-auto text-sm">
				{#if isUpdating}
					<div>Atualizando dados...</div>
				{:else}
					<div>
						Dados serão atualizados em
						<span class="font-mono daisy-countdown">
							<span style="--value:{duration.seconds};"></span>
						</span>
						{duration.seconds === 1 ? "segundo" : "segundos"}
					</div>
				{/if}
			</div>
		</div>
	</div>
</main>
