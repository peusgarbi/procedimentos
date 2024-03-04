import { taskCreateSchema } from "$lib/server/forms/schemas/taskCreateSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

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
		await tasks.insertOne({
			createdAt: new Date(),
			description: form.data.description,
			name: form.data.name,
			dueDate: form.data.dueDate,
			priority: form.data.priority,
			completedAt: null,
		});

		redirect(302, "/tasks?message=Tarefa criada com sucesso!");
	},
};
