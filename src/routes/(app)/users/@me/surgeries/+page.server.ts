import { surgeryQuerySchema } from "$lib/server/forms/schemas/surgeryQuerySchema";
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
	const page = parseInt(url.searchParams.get("page") || "1");
	const per_page = parseInt(url.searchParams.get("per_page") || "10");

	const queryReturn = await queryForSurgeries({
		userId: locals.userId,
		page,
		per_page,
		query,
	});
	const surgeries = queryReturn.surgeries.map((surgery) => ({
		...surgery,
		_id: surgery._id.toHexString(),
		userId: surgery.userId.toHexString(),
	}));
	return {
		surgeries,
		query: queryReturn.query,
		page: queryReturn.page,
		per_page: queryReturn.per_page,
		totalPages: queryReturn.totalPages,
		totalCount: queryReturn.totalCount,
		form: await superValidate(zod(surgeryQuerySchema)),
	};
};

export const actions: Actions = {
	makeQuery: async ({ locals, url, request }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(surgeryQuerySchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const newUrl = url;
		newUrl.searchParams.set("query", form.data.query);
		redirect(302, newUrl);
	},
	deleteSurgery: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		const id = url.searchParams.get("id");
		if (!id) {
			error(404, "ID Inválido");
		}
		const isValidObjectId = ObjectId.isValid(id);
		if (!isValidObjectId) {
			error(404, "ID Inválido");
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}
		const surgeries = mongoDbReturn.client.db("procedimentos").collection<Surgery>("surgeries");
		await surgeries.deleteOne({ _id: new ObjectId(id), userId: locals.userId });

		redirect(302, "/users/@me/surgeries?message=Cirurgia deletada com sucesso!");
	},
};

type QueryForSurgeries = {
	userId: ObjectId;
	query?: string;
	page?: number;
	per_page?: number;
};

type QueryForSurgeriesReturn = {
	surgeries: WithId<Surgery>[];
	query?: string;
	page: number;
	per_page: number;
	totalPages: number;
	totalCount: number;
};

async function queryForSurgeries(data: QueryForSurgeries): Promise<QueryForSurgeriesReturn> {
	const { userId, query } = data;
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

	const surgeries = mongoDbReturn.client.db("procedimentos").collection<Surgery>("surgeries");
	let filter: Filter<Surgery> = { userId };
	if (query) {
		filter = {
			...filter,
			$or: [
				{ surgeryType: { $regex: query, $options: "ix" } },
				{ diagnosis: { $regex: query, $options: "ix" } },
				{ patient: { $regex: query, $options: "ix" } },
				{ role: { $regex: query, $options: "ix" } },
			],
		};
	}

	const totalCount = await surgeries.countDocuments(filter);
	const totalPages: number = Math.ceil(totalCount / per_page);
	if (totalPages === 0) {
		page = 1;
	} else if (page > totalPages) {
		page = totalPages;
	}
	const skip: number = (page - 1) * per_page;
	const documents = await surgeries
		.find(filter, { sort: { _id: -1 } })
		.skip(skip)
		.limit(per_page)
		.toArray();
	return { surgeries: documents, page, per_page, query, totalCount, totalPages };
}
