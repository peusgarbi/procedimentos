import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { ObjectId, type Filter } from "mongodb";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const externalAdmissionsCollection = mongoDbReturn.client
		.db("procedimentos")
		.collection<Admission>("externalAdmissions");
	const unparsedExternalAdmissions = await externalAdmissionsCollection
		.find({}, { sort: { _id: -1 } })
		.toArray();
	const externalAdmissions = unparsedExternalAdmissions.map((value) => ({
		...value,
		_id: value._id.toHexString(),
	}));

	return {
		externalAdmissions,
	};
};

export const actions: Actions = {
	discharge: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		const id = url.searchParams.get("id") || "";
		if (!ObjectId.isValid(id)) {
			error(400, "Id da internação inválido");
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}

		const externalAdmissionsCollection = mongoDbReturn.client
			.db("procedimentos")
			.collection<Admission>("externalAdmissions");
		const filter: Filter<Admission> = { _id: new ObjectId(id) };
		const admissionState = await externalAdmissionsCollection.findOne(filter, {
			projection: { _id: 0, discharged: 1 },
		});
		if (!admissionState) {
			error(404, "Internação não encontrada, impossível atualizar");
		}

		await externalAdmissionsCollection.updateOne(filter, {
			$set: { discharged: !admissionState.discharged },
		});

		url.searchParams.set(
			"message",
			`${admissionState.discharged ? "Readmissão" : "Alta"} realizada com sucesso!`,
		);
		redirect(302, url);
	},
};
