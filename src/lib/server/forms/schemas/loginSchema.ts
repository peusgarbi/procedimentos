import { z } from "zod";

export const loginSchema = z.object({
	password: z.string().min(6, "Mínimo de 6 caracteres").max(40, "Máximo de 40 caracteres").trim(),
});
