import { ccPdfParserSchema } from "$lib/server/forms/schemas/ccPdfParserSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { parseCCPdf } from "$lib/server/parser/ccPdfParser";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
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

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const ccCol = mongoDbReturn.client.db("procedimentos").collection<CC>("cc");
	const unparsedCc = await ccCol.findOne({ date: selectedDate.toFormat("dd/MM/yy") });
	if (!unparsedCc) {
		return {
			form: await superValidate(zod(ccPdfParserSchema)),
			date: selectedDate.toFormat("yyyy-MM-dd"),
		};
	}

	const parsedCc = {
		...unparsedCc,
		_id: unparsedCc._id.toHexString(),
	};

	return {
		parsedCc,
		date: selectedDate.toFormat("yyyy-MM-dd"),
		form: await superValidate(zod(ccPdfParserSchema)),
	};
};

export const actions: Actions = {
	processPdf: async ({ locals, request, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(ccPdfParserSchema));
		if (!form.valid) {
			return fail(400);
		}

		const parsedCc = await parseCCPdf(form.data.ccPdf);
		if (parsedCc.error) {
			error(500, parsedCc.message);
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}
		const ccCol = mongoDbReturn.client.db("procedimentos").collection<CC>("cc");
		await ccCol.updateOne({ date: parsedCc.date }, { $set: parsedCc }, { upsert: true });

		const newUrl = new URL(url);
		newUrl.searchParams.set(
			"date",
			DateTime.fromFormat(parsedCc.date, "dd/MM/yy").toFormat("yyyy-MM-dd"),
		);
		redirect(302, newUrl);
	},
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
};
