import { z } from "zod";

export const ccPdfParserSchema = z.object({
	ccPdf: z
		.instanceof(File, { message: "Favor anexar arquivo" })
		.refine((f) => f.size < 10_000_000, "Max 10 MB upload size"),
});
