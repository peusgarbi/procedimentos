import { z } from "zod";

export const surgeryQuerySchema = z.object({
	query: z
		.string({ required_error: "Campo obrigatório" })
		.min(1, "Mínimo de 1 caractere")
		.max(400, "Máximo de 400 caracteres")
		.trim(),
});
