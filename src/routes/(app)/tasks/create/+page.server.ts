import { taskCreateSchema } from "$lib/server/forms/schemas/taskCreateSchema";
import { sendMessage } from "$lib/server/gateway/telegram";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		redirect(302, "/auth/login");
	}

	return {
		form: await superValidate(zod(taskCreateSchema)),
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.session) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(taskCreateSchema));
		if (!form.valid) {
			fail(400, { form });
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}

		const tasks = mongoDbReturn.client.db("procedimentos").collection<Task>("tasks");

		const telegramMessageId = await sendMessage(`TAREFA CRIADA\n
		- NOME: ${form.data.name}
		- DESCRIÇÃO: ${form.data.description}
		- PRIORIDADE: ${form.data.priority}
		- CRIADA EM: ${DateTime.fromJSDate(new Date(), {
			zone: "America/Sao_Paulo",
		})
			.setLocale("pt-BR")
			.toFormat("dd/MM/yyyy - HH:mm:ss")}
		- REALIZAR ATÉ: ${
			form.data.dueDate
				? DateTime.fromJSDate(form.data.dueDate, {
						zone: "America/Sao_Paulo",
					})
						.setLocale("pt-BR")
						.toFormat("dd/MM/yyyy - HH:mm:ss")
				: "Não informado"
		}\n
		PENDENTE`);

		await tasks.insertOne({
			createdAt: new Date(),
			description: form.data.description,
			name: form.data.name,
			priority: form.data.priority,
			dueDate: form.data.dueDate,
			completedAt: null,
			telegramMessageId,
		});

		redirect(302, "/tasks?message=Tarefa criada com sucesso!");
	},
};
