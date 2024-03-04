import { editPontoFormSchema } from "$lib/server/forms/schemas/editPontoSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const validObjectId = ObjectId.isValid(params.pontoId);
	if (!validObjectId) {
		error(400, "ID Inválido");
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}
	const pontosCollection = mongoDbReturn.client.db("procedimentos").collection<Ponto>("pontos");
	const unparsedPonto = await pontosCollection.findOne({
		userId: locals.userId,
		_id: new ObjectId(params.pontoId),
	});
	if (!unparsedPonto) {
		error(404, "Ponto não encontrado");
	}

	return {
		form: await superValidate(unparsedPonto, zod(editPontoFormSchema)),
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		const validObjectId = ObjectId.isValid(params.pontoId);
		if (!validObjectId) {
			error(400, "ID Inválido");
		}

		const form = await superValidate(request, zod(editPontoFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}
		const pontosCollection = mongoDbReturn.client.db("procedimentos").collection<Ponto>("pontos");
		await pontosCollection.updateOne(
			{
				userId: locals.userId,
				_id: new ObjectId(params.pontoId),
			},
			{
				$set: {
					entryTimestamp: form.data.entryTimestamp,
					exitTimestamp: form.data.exitTimestamp,
					type: form.data.type,
				},
			},
		);

		redirect(302, "/users/@me/pontos?message=Ponto editado com sucesso!");
	},
};
