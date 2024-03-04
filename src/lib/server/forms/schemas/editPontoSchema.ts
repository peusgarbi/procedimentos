import { z } from "zod";

export const editPontoFormSchema = z
	.object({
		type: z.enum(["WORK"]),
		entryTimestamp: z.date({ required_error: "Campo obrigatório" }),
		exitTimestamp: z.date().nullable(),
	})
	.refine(
		({ exitTimestamp, entryTimestamp }) => {
			if (exitTimestamp) {
				return exitTimestamp > entryTimestamp;
			}
		},
		{
			message: "O término deve ocorrer depois do início",
			path: ["exitTimestamp"],
		},
	);
