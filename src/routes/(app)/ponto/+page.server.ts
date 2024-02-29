import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import type { ObjectId } from "mongodb";
import { DateTime } from "luxon";

type Ponto = {
	userId: ObjectId;
	entryTimestamp: Date;
	exitTimestamp: Date | null;
	type: "WORK";
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
	const unparsedPonto = await pontos.findOne({ userId: locals.userId }, { sort: { _id: -1 } });
	if (!unparsedPonto) {
		return {
			lastPonto: null,
		};
	}

	const totalWorkedSeconds = await pontos
		.aggregate<{ totalWorkedTime: number }>([
			{
				$match: {
					userId: locals.userId,
				},
			},
			{
				$addFields: {
					elapsedTime: {
						$dateDiff: {
							startDate: "$entryTimestamp",
							endDate: "$exitTimestamp",
							unit: "second",
						},
					},
				},
			},
			{
				$project: {
					elapsedTime: 1,
				},
			},
			{
				$group: {
					_id: null,
					totalWorkedTime: {
						$sum: "$elapsedTime",
					},
				},
			},
		])
		.toArray();

	const averageWorkedSeconds = await pontos
		.aggregate<{ averageWorkedTime: number }>([
			{
				$match: {
					userId: locals.userId,
				},
			},
			{
				$addFields: {
					elapsedTime: {
						$dateDiff: {
							startDate: "$entryTimestamp",
							endDate: "$exitTimestamp",
							unit: "second",
						},
					},
				},
			},
			{
				$project: {
					elapsedTime: 1,
				},
			},
			{
				$group: {
					_id: null,
					averageWorkedTime: {
						$avg: "$elapsedTime",
					},
				},
			},
		])
		.toArray();

	const lastPonto = {
		...unparsedPonto,
		userId: unparsedPonto.userId.toHexString(),
		_id: unparsedPonto._id.toHexString(),
	};

	return {
		lastPonto,
		totalWorkedSeconds: totalWorkedSeconds[0].totalWorkedTime,
		averageWorkedSeconds: averageWorkedSeconds[0].averageWorkedTime,
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
			const now = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" }).toJSDate();
			if (!lastPonto || lastPonto.exitTimestamp) {
				await pontos.insertOne({
					entryTimestamp: now,
					exitTimestamp: null,
					userId: locals.userId,
					type: "WORK",
				});
			} else {
				await pontos.updateOne({ _id: lastPonto._id }, { $set: { exitTimestamp: now } });
			}
		} catch (err) {
			console.error(err);
			error(500, "Erro ao tentar bater ponto");
		}
	},
};
