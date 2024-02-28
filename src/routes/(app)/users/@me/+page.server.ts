import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Filter, ObjectId, WithId } from "mongodb";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const query = url.searchParams.get("query") || undefined;
	const page = parseInt(url.searchParams.get("page") || "1");
	const per_page = parseInt(url.searchParams.get("per_page") || "10");

	const unparsedSurgeries = await queryForSurgeries({
		userId: locals.userId,
		page,
		per_page,
		query,
	});
	const surgeries = unparsedSurgeries.map((surgery) => ({
		...surgery,
		_id: surgery._id.toHexString(),
		userId: surgery.userId.toHexString(),
	}));
	return {
		surgeries,
	};
};

type QueryForSurgeries = {
	userId: ObjectId;
	query?: string;
	page?: number;
	per_page?: number;
};

async function queryForSurgeries(data: QueryForSurgeries): Promise<WithId<Surgery>[]> {
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
			ni: { $regex: query, $options: "ix" },
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
	return documents;
}
