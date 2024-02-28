import { useSecureCookies, userPassword } from "$lib/server/environment/environment";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { loginSchema } from "$lib/server/forms/schemas/loginSchema";
import { superValidate, message } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ locals, request }) => {
	if (locals.session) {
		redirect(302, "/auth/login");
	}

	const userAgent = request.headers.get("user-agent") || "";

	return {
		userAgent,
		form: await superValidate(zod(loginSchema)),
	};
};

export const actions: Actions = {
	default: async ({ locals, cookies, request, getClientAddress }) => {
		if (locals.session) {
			redirect(302, "/auth/login");
		}

		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		if (form.data.password !== userPassword) {
			return message(form, { type: "error", text: "Credenciais inválidas" }, { status: 401 });
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}

		const sessions = mongoDbReturn.client.db("procedimentos").collection<Session>("sessions");
		const now = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" });
		const nowJs = now.toJSDate();
		const expiresAt = now.plus({ days: 1 }).toJSDate();
		const userAgent = request.headers.get("user-agent") || "";
		const newSession = await sessions.insertOne({
			createdAt: nowJs,
			lastUsed: nowJs,
			expiresAt,
			userAgent,
			ip: getClientAddress(),
		});

		cookies.set("accessToken", newSession.insertedId.toHexString(), {
			path: "/",
			httpOnly: true,
			secure: useSecureCookies,
			sameSite: "lax",
			expires: expiresAt,
		});
		locals.session = true;
		redirect(302, "/");
	},
};
