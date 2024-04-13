import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

type TotalNasos = {
	_id: null;
	totalEstrobo: number;
	totalNaso: number;
	totalNasolaringe: number;
	totalOtofibroscopia: number;
	totalGeral: number;
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const mongodbReturn = await getMongoDb();
	if (mongodbReturn.error) {
		error(500, "Erro ao tentar se conectar ao banco de dados");
	}

	const nasosColl = mongodbReturn.client.db("procedimentos").collection<Naso>("nasos");

	const totalNasos = await nasosColl
		.aggregate<TotalNasos>([
			{
				$group: {
					_id: null,
					totalEstrobo: { $sum: "$estrobo" },
					totalNaso: { $sum: "$naso" },
					totalNasolaringe: { $sum: "$nasoLaringe" },
					totalOtofibroscopia: {
						$sum: "$otofibroscopia",
					},
					totalGeral: {
						$sum: {
							$add: ["$estrobo", "$naso", "$nasoLaringe", "$otofibroscopia"],
						},
					},
				},
			},
		])
		.toArray();

	return totalNasos[0];
};
