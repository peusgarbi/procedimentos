import { z } from "zod";

export const admissionQuerySchema = z.object({
	query: z.string().optional().nullable(),
	discharged: z.string().optional().nullable(),
});
