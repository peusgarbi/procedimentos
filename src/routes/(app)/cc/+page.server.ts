import { ccPdfParserSchema } from "$lib/server/forms/schemas/ccPdfParserSchema";
import { parseCCPdf } from "$lib/server/parser/ccPdfParser";
import type { Actions, PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	return {
		form: await superValidate(zod(ccPdfParserSchema)),
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(ccPdfParserSchema));
		if (!form.valid) {
			return fail(400);
		}

		const parsedCc = await parseCCPdf(form.data.ccPdf);
		return {
			parsedCc,
		};
	},
};
