import { surgeryRegisterSchema } from "$lib/server/forms/schemas/surgeryRegisterSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { uploadFile } from "$lib/server/gateway/bunny";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { DateTime, Interval } from "luxon";

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

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}
		const surgeries = mongoDbReturn.client.db("procedimentos").collection<Surgery>("surgeries");
		const insertedSurgery = await surgeries.insertOne({
			createdAt: new Date(),
			startTime: form.data.startTime,
			endTime: form.data.endTime,
			durationInSeconds: Interval.fromDateTimes(
				DateTime.fromJSDate(form.data.startTime),
				DateTime.fromJSDate(form.data.endTime),
			)
				.toDuration()
				.as("seconds"),
			diagnosis: form.data.diagnosis,
			patient: form.data.patientInitials,
			surgeryType: form.data.otherSurgeryType ? form.data.otherSurgeryType : form.data.surgeryType,
			role: form.data.otherRole ? form.data.otherRole : form.data.role,
			userId: locals.userId,
			fileExtension: form.data.file?.name.split(".").pop() || null,
		});

		if (form.data.file) {
			const fileName = `${insertedSurgery.insertedId.toHexString()}.${form.data.file.name.split(".").pop()}`;
			await uploadFile(form.data.file, locals.userId.toHexString(), fileName);
		}

		redirect(302, "/users/@me/surgeries?message=Cirurgia registrada com sucesso!");
	},
};
