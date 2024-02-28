import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { error, type Handle } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get("accessToken");
	if (!accessToken) {
		event.locals.session = false;
		event.cookies.delete("accessToken", {
			path: "/",
		});
		return await resolve(event);
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const now = DateTime.local({ locale: "pt-BR", zone: "America/Sao_Paulo" }).toJSDate();
	const _id = new ObjectId(accessToken);
	const sessions = mongoDbReturn.client.db("procedimentos").collection<Session>("sessions");
	const session = await sessions.findOneAndUpdate({ _id }, { $set: { lastUsed: now } });
	if (!session) {
		event.locals.session = false;
		event.cookies.delete("accessToken", {
			path: "/",
		});
		return await resolve(event);
	}

	if (session.expiresAt < now) {
		event.locals.session = false;
		event.cookies.delete("accessToken", {
			path: "/",
		});
		try {
			await sessions.deleteOne({ _id });
		} catch (error) {
			console.error(error);
		}
		return await resolve(event);
	}

	event.locals.session = true;
	event.locals.userId = session.userId;
	return await resolve(event);
};
