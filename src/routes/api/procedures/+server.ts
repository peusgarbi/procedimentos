import { parseProcedures } from "$lib/server/parser/procedureParser";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = (await request.json()) as { procedures: string };
		const procedures = parseProcedures(data.procedures);
		return json(procedures);
	} catch (error) {
		console.error(error);
		return json({ error: "Bad request" }, { status: 400 });
	}
};
