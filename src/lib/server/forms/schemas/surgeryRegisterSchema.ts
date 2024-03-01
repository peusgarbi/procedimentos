import { z } from "zod";

export const surgeryRegisterSchema = z
	.object({
		patientInitials: z.string({ required_error: "Campo obrigatório" }).trim(),
		diagnosis: z.string({ required_error: "Campo obrigatório" }).trim(),
		surgeryType: z.string({ required_error: "Campo obrigatório" }).trim(),
		otherSurgeryType: z.string().trim().optional().nullable(),
		role: z.string({ required_error: "Campo obrigatório" }).trim(),
		otherRole: z.string().trim().optional().nullable(),
		startTime: z.date(),
		endTime: z.date(),
		file: z
			.instanceof(File, { message: "Favor anexar arquivo" })
			.refine((f) => f.size < 10_000_000, "Max 10 MB upload size")
			.optional()
			.nullable(),
	})
	.refine(({ endTime, startTime }) => endTime > startTime, {
		message: "O término deve ocorrer depois do início",
		path: ["endTime"],
	});
