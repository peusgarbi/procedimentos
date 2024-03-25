type Procedure = {
	name: string;
	nicknames: string[];
};

const proceduresArray: Procedure[] = [
	{ name: "Adenoidectomia", nicknames: ["ADENO", "ADENOIDECTOMIA", "ADENOIDE"] },
	{ name: "Amigdalectomia", nicknames: ["AMIGDALECTOMIA"] },
	{ name: "Frenulotomia Labial", nicknames: ["FRENULOTOMIA LABIAL", "FRENOTOMIA LABIAL"] },
	{ name: "Frenulotomia Lingual", nicknames: ["FRENULOTOMIA LINGUAL", "FRENOTOMIA LINGUAL"] },
	{ name: "Polipectomia", nicknames: ["POLIPECTOMIA"] },
	{ name: "Septoplastia", nicknames: ["SEPTOPLASTIA FUNCIONAL", "SEPTOPLASTIA", "SEPTO"] },
	{
		name: "Timpanotomia Exploradora",
		nicknames: ["TIMPANOTOMIA EXPLORADORA", "TIMPANOTOMIA EXPLORADA", "TE"],
	},
	{
		name: "Timpanotomia para Tubo de Ventilação",
		nicknames: ["TIMPANOTOMIA PARA TUBO DEVENTILACAO", "TV"],
	},
	{
		name: "Turbinectomia Bilateral",
		nicknames: ["TURBINECTOMIA BILATERAL", "TURBINECTOMIA", "CIT"],
	},
];

const palavrasIndesejadas = ["AUSTA", "BRADESCO", "HB", "UNIMED"];
const palavrasIndesejadasPadrao = new RegExp("\\b(" + palavrasIndesejadas.join("|") + ")\\b", "gi");

export type ParsedProcedures = {
	foundProcedures: Procedure[];
	notFoundProcedures: string[];
};

export function parseProcedures(proceduresString: string): ParsedProcedures {
	const procedures = proceduresString
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(palavrasIndesejadasPadrao, "")
		.toUpperCase()
		.split(/[^a-zA-Z0-9À-ÖØ-öø-ÿ\s]+/)
		.map((part) => part.trim())
		.filter((part) => part !== "");
	const foundProcedures: Procedure[] = [];
	const notFoundProcedures: string[] = [];
	procedures.forEach((procedure) => {
		const searchedProcedure = proceduresArray.find((p) => p.nicknames.includes(procedure));
		if (searchedProcedure) {
			foundProcedures.push(searchedProcedure);
		} else {
			notFoundProcedures.push(procedure);
		}
	});
	return {
		foundProcedures,
		notFoundProcedures,
	};
}
