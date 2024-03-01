import { getFile } from "$lib/server/gateway/bunny";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.session || !locals.userId) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const fileResponse = await getFile(locals.userId.toHexString(), params.fileName);
	if (fileResponse.error) {
		return json(
			{
				error: "Service unavailable",
				message: fileResponse.message,
			},
			{ status: fileResponse.status },
		);
	}

	return new Response(fileResponse.file);
};
