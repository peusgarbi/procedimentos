import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Filter, ObjectId, WithId } from "mongodb";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const page = parseInt(url.searchParams.get("page") || "1");
	const per_page = parseInt(url.searchParams.get("per_page") || "10");

	const queryReturn = await queryForPontos({
		userId: locals.userId,
		page,
		per_page,
	});
	const pontos = queryReturn.pontos.map((ponto) => ({
		...ponto,
		_id: ponto._id.toHexString(),
		userId: ponto.userId.toHexString(),
	}));
	return {
		pontos,
		page: queryReturn.page,
		per_page: queryReturn.per_page,
		totalPages: queryReturn.totalPages,
		totalCount: queryReturn.totalCount,
	};
};

type QueryForPontos = {
	userId: ObjectId;
	page: number;
	per_page: number;
};

type QueryForPontosReturn = {
	pontos: WithId<Ponto>[];
	page: number;
	per_page: number;
	totalPages: number;
	totalCount: number;
};

async function queryForPontos(data: QueryForPontos): Promise<QueryForPontosReturn> {
	const { userId } = data;
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

	const pontos = mongoDbReturn.client.db("procedimentos").collection<Ponto>("pontos");
	const filter: Filter<Ponto> = { userId };
	const totalCount = await pontos.countDocuments(filter);
	const totalPages: number = Math.ceil(totalCount / per_page);
	if (totalPages === 0) {
		page = 1;
	} else if (page > totalPages) {
		page = totalPages;
	}
	const skip: number = (page - 1) * per_page;
	const documents = await pontos
		.find(filter, { sort: { _id: -1 } })
		.skip(skip)
		.limit(per_page)
		.toArray();
	return { pontos: documents, page, per_page, totalCount, totalPages };
}
