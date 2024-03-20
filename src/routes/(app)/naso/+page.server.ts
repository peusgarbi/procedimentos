import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Filter, ObjectId, UpdateFilter } from "mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}
	let selectedDate = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" }).startOf("day");

	const date = url.searchParams.get("date");
	if (!date) {
		const newUrl = new URL(url);
		newUrl.searchParams.set("date", selectedDate.toFormat("yyyy-MM-dd"));
		redirect(302, newUrl);
	}
	const tryedDate = DateTime.fromFormat(date, "yyyy-MM-dd", {
		locale: "pt-BR",
		zone: "America/Sao_Paulo",
	});
	if (!tryedDate.isValid) {
		const newUrl = new URL(url);
		newUrl.searchParams.set("date", selectedDate.toFormat("yyyy-MM-dd"));
		redirect(302, newUrl);
	}
	selectedDate = tryedDate;

	const mongodbReturn = await getMongoDb();
	if (mongodbReturn.error) {
		error(500, "Erro ao tentar se conectar ao banco de dados");
	}

	const nasosColl = mongodbReturn.client.db("procedimentos").collection<Naso>("nasos");
	const tomorrow = selectedDate.plus({ days: 1 });

	const unparsedNasos = await nasosColl.findOne({
		date: {
			$gte: selectedDate.toJSDate(),
			$lt: tomorrow.toJSDate(),
		},
		userId: locals.userId,
	});

	if (!unparsedNasos) {
		await nasosColl.insertOne({
			userId: locals.userId,
			date: selectedDate.toJSDate(),
			estrobo: 0,
			naso: 0,
			nasoLaringe: 0,
			otofibroscopia: 0,
		});
		redirect(302, url);
	}
	const nasos = {
		...unparsedNasos,
		_id: unparsedNasos._id.toHexString(),
		userId: unparsedNasos.userId.toHexString(),
	};

	return {
		nasos,
		date: selectedDate.toFormat("yyyy-MM-dd"),
	};
};

export const actions: Actions = {
	selectDate: async ({ locals, request, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const formData = await request.formData();
		const dateInput = formData.get("dateInput")?.toString();
		if (!dateInput) {
			error(400);
		}
		const tryedDate = DateTime.fromFormat(dateInput, "yyyy-MM-dd", {
			locale: "pt-BR",
			zone: "America/Sao_Paulo",
		});
		if (!tryedDate.isValid) {
			error(400);
		}
		const newUrl = new URL(url);
		newUrl.searchParams.set("date", tryedDate.toFormat("yyyy-MM-dd"));
		redirect(302, newUrl);
	},
	incrementNaso: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "NASO", "INCREMENT");
		if (!success) {
			error(400);
		}
	},
	decrementNaso: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "NASO", "DECREMENT");
		if (!success) {
			error(400);
		}
	},
	incrementNasoLaringe: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "NASOLARINGE", "INCREMENT");
		if (!success) {
			error(400);
		}
	},
	decrementNasoLaringe: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "NASOLARINGE", "DECREMENT");
		if (!success) {
			error(400);
		}
	},
	incrementEstrobo: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "ESTROBO", "INCREMENT");
		if (!success) {
			error(400);
		}
	},
	decrementEstrobo: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "ESTROBO", "DECREMENT");
		if (!success) {
			error(400);
		}
	},
	incrementOto: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "OTOFIBRO", "INCREMENT");
		if (!success) {
			error(400);
		}
	},
	decrementOto: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const date = url.searchParams.get("date");
		const success = await updateNumbers(date, locals.userId, "OTOFIBRO", "DECREMENT");
		if (!success) {
			error(400);
		}
	},
};

async function updateNumbers(
	date: string | null,
	userId: ObjectId,
	type: "NASO" | "NASOLARINGE" | "ESTROBO" | "OTOFIBRO",
	how: "INCREMENT" | "DECREMENT",
): Promise<boolean> {
	const mongodbReturn = await getMongoDb();
	if (mongodbReturn.error) {
		return false;
	}
	if (!date) {
		return false;
	}
	const tryedDate = DateTime.fromFormat(date, "yyyy-MM-dd", {
		locale: "pt-BR",
		zone: "America/Sao_Paulo",
	});
	if (!tryedDate.isValid) {
		return false;
	}
	let filter: Filter<Naso> = { userId, date: tryedDate.toJSDate() };
	let updateFilter: UpdateFilter<Naso> = {};
	switch (type) {
		case "NASO":
			if (how === "INCREMENT") {
				updateFilter = { $inc: { naso: 1 } };
			} else {
				filter = {
					...filter,
					naso: { $gt: 0 },
				};
				updateFilter = { $inc: { naso: -1 } };
			}
			break;
		case "NASOLARINGE":
			if (how === "INCREMENT") {
				updateFilter = { $inc: { nasoLaringe: 1 } };
			} else {
				filter = {
					...filter,
					nasoLaringe: { $gt: 0 },
				};
				updateFilter = { $inc: { nasoLaringe: -1 } };
			}
			break;
		case "ESTROBO":
			if (how === "INCREMENT") {
				updateFilter = { $inc: { estrobo: 1 } };
			} else {
				filter = {
					...filter,
					estrobo: { $gt: 0 },
				};
				updateFilter = { $inc: { estrobo: -1 } };
			}
			break;
		case "OTOFIBRO":
			if (how === "INCREMENT") {
				updateFilter = { $inc: { otofibroscopia: 1 } };
			} else {
				filter = {
					...filter,
					otofibroscopia: { $gt: 0 },
				};
				updateFilter = { $inc: { otofibroscopia: -1 } };
			}
			break;
		default:
			return false;
	}
	const nasosColl = mongodbReturn.client.db("procedimentos").collection<Naso>("nasos");
	await nasosColl.updateOne(filter, updateFilter);
	return true;
}
