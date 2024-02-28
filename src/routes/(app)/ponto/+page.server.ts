import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import type { ObjectId } from "mongodb";
import { DateTime } from "luxon";

type Ponto = {
	userId: ObjectId;
	timestamp: Date;
	type: "IN" | "OUT";
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const mongodbReturn = await getMongoDb();
	if (mongodbReturn.error) {
		error(500, "Erro ao tentar se conectar ao banco de dados");
	}

	const pontos = mongodbReturn.client.db("procedimentos").collection<Ponto>("pontos");
	const lastPonto = await pontos.findOne({ userId: locals.userId }, { sort: { _id: -1 } });

	return {
		lastPonto: {
			type: lastPonto?.type || "OUT",
			timestamp: lastPonto?.timestamp || new Date(),
		},
		firstTimeUsingPonto: lastPonto ? false : true,
	};
};

export const actions: Actions = {
	default: async ({ locals }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		try {
			const mongodbReturn = await getMongoDb();
			if (mongodbReturn.error) {
				error(500, "Erro ao tentar se conectar ao banco de dados");
			}

			const pontos = mongodbReturn.client.db("procedimentos").collection<Ponto>("pontos");
			const lastPonto = await pontos.findOne({ userId: locals.userId }, { sort: { _id: -1 } });
			const timestamp = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" }).toJSDate();
			await pontos.insertOne({
				timestamp,
				userId: locals.userId,
				type: lastPonto?.type === "IN" ? "OUT" : "IN",
			});
		} catch (err) {
			console.error(err);
			error(500, "Erro ao tentar bater ponto");
		}
	},
};
