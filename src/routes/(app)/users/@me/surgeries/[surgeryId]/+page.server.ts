import { surgeryRegisterSchema } from "$lib/server/forms/schemas/surgeryRegisterSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { DateTime, Interval } from "luxon";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const isValidObjectId = ObjectId.isValid(params.surgeryId);
	if (!isValidObjectId) {
		error(400, "ID Inválido");
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const surgeries = mongoDbReturn.client.db("procedimentos").collection<Surgery>("surgeries");
	const unparsedSurgery = await surgeries.findOne({
		_id: new ObjectId(params.surgeryId),
		userId: locals.userId,
	});
	if (!unparsedSurgery) {
		error(404, "Cirurgia não encontrada");
	}

	const form = await superValidate(unparsedSurgery, zod(surgeryRegisterSchema));

	return {
		form,
	};
};

export const actions: Actions = {
	default: async ({ locals, request, params }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		const isValidObjectId = ObjectId.isValid(params.surgeryId);
		if (!isValidObjectId) {
			error(400, "ID Inválido");
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
		await surgeries.updateOne(
			{ _id: new ObjectId(params.surgeryId), userId: locals.userId },
			{
				$set: {
					diagnosis: form.data.diagnosis,
					surgeryType: form.data.otherSurgeryType
						? form.data.otherSurgeryType
						: form.data.surgeryType,
					role: form.data.otherRole ? form.data.otherRole : form.data.role,
					patient: form.data.patient,
					startTime: form.data.startTime,
					endTime: form.data.endTime,
					durationInSeconds: Interval.fromDateTimes(
						DateTime.fromJSDate(form.data.startTime),
						DateTime.fromJSDate(form.data.endTime),
					)
						.toDuration()
						.as("seconds"),
				},
			},
		);

		redirect(302, "/users/@me/surgeries?message=Cirurgia editada com sucesso!");
	},
};
