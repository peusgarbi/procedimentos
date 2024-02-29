import { z } from "zod";

export const changePasswordFormSchema = z
	.object({
		currentPassword: z.string().trim(),
		newPassword: z
			.string()
			.min(6, "Mínimo de 6 caracteres")
			.max(40, "Máximo de 40 caracteres")
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\s]).{6,40}$/, "Senha inválida")
			.trim(),
		confirmPassword: z
			.string()
			.min(6, "Mínimo de 6 caracteres")
			.max(40, "Máximo de 40 caracteres")
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\s]).{6,40}$/, "Senha inválida")
			.trim(),
	})
	.refine(
		(value) => {
			return value.confirmPassword === value.newPassword;
		},
		{ message: "Senhas não coincidem", path: ["confirmPassword"] },
	);
