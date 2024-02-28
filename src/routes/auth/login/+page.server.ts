import { useSecureCookies } from "$lib/server/environment/environment";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { loginSchema } from "$lib/server/forms/schemas/loginSchema";
import { superValidate, message } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { DateTime } from "luxon";
import bcrypt from "bcrypt";

type Users = {
	email: string;
	password: string;
};

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

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}

		const procedimentos = mongoDbReturn.client.db("procedimentos");
		const users = procedimentos.collection<Users>("users");
		const user = await users.findOne({ email: form.data.email });
		if (!user) {
			return message(form, { type: "error", text: "Credenciais inválidas" }, { status: 401 });
		}

		const validPassword = bcrypt.compareSync(form.data.password, user.password);
		if (!validPassword) {
			return message(form, { type: "error", text: "Credenciais inválidas" }, { status: 401 });
		}

		const sessions = procedimentos.collection<Session>("sessions");
		const now = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" });
		const nowJs = now.toJSDate();
		const expiresAt = now.plus({ days: 1 }).toJSDate();
		const userAgent = request.headers.get("user-agent") || "";
		const newSession = await sessions.insertOne({
			userId: user._id,
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
