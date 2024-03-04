import { admissionQuerySchema } from "$lib/server/forms/schemas/admissionQuerySchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { ObjectId, type Filter, type WithId } from "mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const query = url.searchParams.get("query") || undefined;
	const discharged = url.searchParams.get("discharged") || undefined;
	const page = parseInt(url.searchParams.get("page") || "1");
	const per_page = parseInt(url.searchParams.get("per_page") || "10");

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const queryReturn = await queryForAdmissions({ query, page, per_page, discharged });
	const externalAdmissions = queryReturn.externalAdmissions.map((value) => ({
		...value,
		_id: value._id.toHexString(),
	}));

	return {
		query: queryReturn.query,
		page: queryReturn.page,
		per_page: queryReturn.per_page,
		totalPages: queryReturn.totalPages,
		totalCount: queryReturn.totalCount,
		externalAdmissions,
		queryForm: await superValidate({ query, discharged }, zod(admissionQuerySchema)),
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
	makeQuery: async ({ locals, request, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(admissionQuerySchema));
		if (!form.valid) {
			fail(400, { form });
		}

		url.searchParams.set("discharged", form.data.discharged || "all");
		if (form.data.query) {
			url.searchParams.set("query", form.data.query);
		}

		redirect(302, url);
	},
};

type QueryForAdmissions = {
	query?: string;
	page?: number;
	per_page?: number;
	discharged?: string;
};

type QueryForAdmissionsReturn = {
	externalAdmissions: WithId<Admission>[];
	query?: string;
	page: number;
	per_page: number;
	totalPages: number;
	totalCount: number;
};

async function queryForAdmissions(data: QueryForAdmissions): Promise<QueryForAdmissionsReturn> {
	const { query, discharged } = data;
	let { page, per_page } = data;
	if (!per_page || per_page < 1) {
		per_page = 10;
	}
	if (per_page > 100) {
		per_page = 100;
	}
	if (!page || page < 1) {
		page = 1;
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const externalAdmissions = mongoDbReturn.client
		.db("procedimentos")
		.collection<Admission>("externalAdmissions");
	let filter: Filter<Admission> = {};
	if (query) {
		filter = {
			...filter,
			$or: [{ identification: { $regex: query, $options: "ix" } }],
		};
	}
	if (discharged === "true" || discharged === "false") {
		filter = {
			...filter,
			discharged: discharged === "true" ? true : false,
		};
	}

	const totalCount = await externalAdmissions.countDocuments(filter);
	const totalPages: number = Math.ceil(totalCount / per_page);
	if (totalPages === 0) {
		page = 1;
	} else if (page > totalPages) {
		page = totalPages;
	}
	const skip: number = (page - 1) * per_page;
	const documents = await externalAdmissions
		.find(filter, { sort: { _id: -1 } })
		.skip(skip)
		.limit(per_page)
		.toArray();
	return { externalAdmissions: documents, page, per_page, query, totalCount, totalPages };
}
