import { z } from "zod";

export const surgeryQuerySchema = z.object({
	query: z
		.string({ required_error: "Campo obrigatório" })
		.max(400, "Máximo de 400 caracteres")
		.trim(),
});
