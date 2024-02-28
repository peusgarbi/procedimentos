import { surgeryRegisterSchema } from "$lib/server/forms/schemas/surgeryRegisterSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { ObjectId } from "mongodb";

type Surgery = {
	userId: ObjectId;
	surgeryType: string;
	role: string;
	diagnosis: string;
	patient: string;
	date: Date;
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		redirect(302, "/auth/login");
	}

	return {
		form: await superValidate(zod(surgeryRegisterSchema)),
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) {
			redirect(302, "/auth/login");
		}

		const form = await superValidate(request, zod(surgeryRegisterSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const mongoDbReturn = await getMongoDb();
			if (mongoDbReturn.error) {
				error(500, "Erro ao tentar conectar com o banco de dados");
			}
			const surgeries = mongoDbReturn.client.db("procedimentos").collection<Surgery>("surgeries");
			await surgeries.insertOne({
				date: new Date(),
				diagnosis: form.data.diagnosis,
				patient: form.data.patientInitials,
				surgeryType: form.data.otherSurgeryType
					? form.data.otherSurgeryType
					: form.data.surgeryType,
				role: form.data.otherRole ? form.data.otherRole : form.data.role,
				userId: locals.userId,
			});
		} catch (err) {
			console.error(error);
			error(500, "Erro ao tentar registrar cirurgia");
		}
	},
};
