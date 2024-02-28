import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ObjectId } from "mongodb";

export const POST: RequestHandler = async ({ locals, cookies }) => {
	const accessToken = cookies.get("accessToken");
	if (!locals.session || !accessToken) {
		redirect(302, "/auth/login");
	}

	cookies.delete("accessToken", {
		path: "/",
	});
	locals.session = false;

	try {
		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}
		const sessions = mongoDbReturn.client.db("procedimentos").collection<Session>("sessions");
		await sessions.deleteOne({ _id: new ObjectId(accessToken) });
	} catch (error) {
		console.error(error);
	}

	redirect(302, "/auth/login");
};
