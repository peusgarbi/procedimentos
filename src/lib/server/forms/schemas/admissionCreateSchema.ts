import { z } from "zod";

export const admissionCreateSchema = z.object({
	hospital: z.string().min(1, "Campo obrigatório").trim(),
	identification: z.string().min(1, "Campo obrigatório").trim(),
	responsableDoctor: z.string().min(1, "Campo obrigatório").trim(),
	bed: z.string().min(1, "Campo obrigatório").trim(),
	medications: z.string().min(1, "Campo obrigatório").trim(),
	diagnosticHypothesis: z.string().min(1, "Campo obrigatório").trim(),
	history: z.string().min(1, "Campo obrigatório").trim(),
	personalBackground: z.string().min(1, "Campo obrigatório").trim(),
	proceduresPerformed: z.string().min(1, "Campo obrigatório").trim(),
	clinicalExamination: z.string().min(1, "Campo obrigatório").trim(),
	imaging: z.string().min(1, "Campo obrigatório").trim(),
	labs: z.string().min(1, "Campo obrigatório").trim(),
	therapeuticPlan: z.string().min(1, "Campo obrigatório").trim(),
	evolutions: z.array(z.string()),
});
