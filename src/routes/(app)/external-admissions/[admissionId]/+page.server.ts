import { admissionCreateSchema } from "$lib/server/forms/schemas/admissionCreateSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { ObjectId } from "mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	if (!ObjectId.isValid(params.admissionId)) {
		error(400, "ID inválido");
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const tasks = mongoDbReturn.client
		.db("procedimentos")
		.collection<Admission>("externalAdmissions");

	const admission = await tasks.findOne({ _id: new ObjectId(params.admissionId) });

	return {
		form: await superValidate(admission, zod(admissionCreateSchema)),
	};
};

export const actions: Actions = {
	default: async ({ locals, request, params }) => {
		if (!locals.session) {
			redirect(302, "/auth/login");
		}

		if (!ObjectId.isValid(params.admissionId)) {
			error(400, "ID inválido");
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

		await tasks.updateOne({ _id: new ObjectId(params.admissionId) }, { $set: form.data });

		redirect(302, "/external-admissions?message=Internação editada com sucesso!");
	},
};
