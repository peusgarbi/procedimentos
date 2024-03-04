import { z } from "zod";

export const taskCreateSchema = z.object({
	name: z
		.string({ required_error: "Campo obrigatório" })
		.min(1, "Campo obrigatório")
		.max(400, "Máximo de 400 caracteres")
		.trim(),
	description: z
		.string({ required_error: "Campo obrigatório" })
		.min(1, "Campo obrigatório")
		.max(400, "Máximo de 400 caracteres")
		.trim(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
	dueDate: z.date().nullable(),
});
