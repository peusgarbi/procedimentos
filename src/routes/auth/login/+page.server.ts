import { useSecureCookies } from "$lib/server/environment/environment";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import type { Actions, PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		redirect(302, "/auth/login");
	}
};

export const actions: Actions = {
	default: async ({ locals, cookies, request, getClientAddress }) => {
		if (locals.session) {
			redirect(302, "/auth/login");
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
