import { z } from "zod";

export const loginSchema = z.object({
	email: z.string({ required_error: "E-mail é obrigatório" }).email("E-mail inválido").trim(),
	password: z
		.string({ required_error: "Senha é obrigatória" })
		.min(6, "Mínimo de 6 caracteres")
		.max(40, "Máximo de 40 caracteres")
		.trim(),
});
