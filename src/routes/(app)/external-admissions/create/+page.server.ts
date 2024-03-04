import { admissionCreateSchema } from "$lib/server/forms/schemas/admissionCreateSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	return {
		form: await superValidate(zod(admissionCreateSchema)),
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.session) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(admissionCreateSchema));
		if (!form.valid) {
			fail(400, { form });
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}

		const tasks = mongoDbReturn.client
			.db("procedimentos")
			.collection<Admission>("externalAdmissions");

		await tasks.insertOne({
			discharged: false,
			...form.data,
		});

		redirect(302, "/external-admissions?message=Internação criada com sucesso!");
	},
};
