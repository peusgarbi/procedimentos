import PDFParser from "pdf2json";

async function extractTextFromPDF(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return new Promise((resolve, reject) => {
		const pdfParser = new PDFParser();
		pdfParser.on("pdfParser_dataReady", (pdfData) => {
			// Obtendo o texto do PDF
			const text = pdfData.Pages.reduce((acc, page) => {
				page.Texts.forEach((text) => {
					acc += text.R.map((r) => decodeURIComponent(r.T)).join("");
				});
				return acc;
			}, "");

			resolve(text);
		});

		// Definindo evento de erro
		pdfParser.on("pdfParser_dataError", (error) => {
			reject(error);
		});

		pdfParser.parseBuffer(buffer);
	});
}

type Salas = {
	date: string;
	sala1: string;
	sala2: string;
	sala3: string;
	sala4: string;
	sala5: string;
};

function dividir_salas(texto: string): Salas {
	const sala1regex = /Sala de Cirurgia 01([\s\S]*?)Sala de Cirurgia 02/s;
	const sala2regex = /Sala de Cirurgia 02([\s\S]*?)Sala de Cirurgia 03/s;
	const sala3regex = /Sala de Cirurgia 03([\s\S]*?)Sala de Cirurgia 04/s;
	const sala4regex = /Sala de Cirurgia 04([\s\S]*?)Sala de Cirurgia 05/s;
	const sala5regex = /Sala de Cirurgia 05([\s\S]*?)$/s;
	const dataRegex = /Data: (.*?)Sala/;

	const sala1 = sala1regex.exec(texto);
	const sala2 = sala2regex.exec(texto);
	const sala3 = sala3regex.exec(texto);
	const sala4 = sala4regex.exec(texto);
	const sala5 = sala5regex.exec(texto);
	const date = dataRegex.exec(texto);

	if (!sala1 || !sala2 || !sala3 || !sala4 || !sala5 || !date) {
		throw new Error("Texto não está no formato esperado");
	}

	return {
		date: date[1],
		sala1: sala1[1],
		sala2: sala2[1],
		sala3: sala3[1],
		sala4: sala4[1],
		sala5: sala5[1],
	};
}

function dividir_cirurgias_da_sala(texto: string): string[] {
	const regex1 = /(?:Horário:.*?)(?=Horário:|$)/gs;
	const match = texto.match(regex1)?.map((value) => value.trim());
	return match || [];
}

export interface Cirurgia {
	sala: string;
	horario: string;
	paciente: string;
	idade: string;
	nascimento: string;
	cirurgiao: string;
	acomodacao: string;
	convenio: string;
	servicos: string;
}

async function extrair_info_de_cirurgia_de_uma_sala(
	sala: string,
	texto: string,
): Promise<Cirurgia[]> {
	const cirurgiasString = dividir_cirurgias_da_sala(texto);

	const horarioRegex = /Horário:(.*?)Paciente/s;
	const pacienteRegex = /Paciente:(.*?)Idade/s;
	const idadeRegex = /Idade:(.*?)Nascimento/s;
	const nascimentoRegex = /Nascimento:(.*?)Cirurgião/s;
	const cirurgiaoRegex = /Cirurgião:(.*?)Acomodação/s;
	const acomodacaoRegex = /Acomodação(.*?)Convênio/s;
	const convenioRegex = /Convênio:(.*?)Serviços/s;
	const servicosRegex = /Serviços:(.*?)(?=\nMateriais|\sMateriais|Materiais|\nObs|\sObs|Obs|$)/s;

	const cirurgias = cirurgiasString.map((cirurgia) => {
		const horario = horarioRegex.exec(cirurgia);
		const paciente = pacienteRegex.exec(cirurgia);
		const idade = idadeRegex.exec(cirurgia);
		const nascimento = nascimentoRegex.exec(cirurgia);
		const cirurgiao = cirurgiaoRegex.exec(cirurgia);
		const acomodacao = acomodacaoRegex.exec(cirurgia);
		const convenio = convenioRegex.exec(cirurgia);
		const servicos = servicosRegex.exec(cirurgia);

		if (
			!horario ||
			!paciente ||
			!idade ||
			!nascimento ||
			!cirurgiao ||
			!acomodacao ||
			!convenio ||
			!servicos
		) {
			throw new Error("Erro ao extrair info de cirurgia");
		}

		return {
			sala,
			horario: horario[1].trim(),
			paciente: paciente[1].trim(),
			idade: idade[1].trim(),
			nascimento: nascimento[1].trim(),
			cirurgiao: cirurgiao[1].trim(),
			acomodacao: acomodacao[1].trim(),
			convenio: convenio[1].trim(),
			servicos: servicos[1].trim(),
		};
	});

	return cirurgias;
}

interface ParsedCC {
	error: false;
	date: string;
	salas: Cirurgia[][];
}

interface ParsedCCError {
	error: true;
	message: string;
}

export async function parseCCPdf(file: File): Promise<ParsedCC | ParsedCCError> {
	try {
		const text = await extractTextFromPDF(file);
		const salas = dividir_salas(text);
		const salasParsed = await Promise.all([
			extrair_info_de_cirurgia_de_uma_sala("Sala 1", salas.sala1),
			extrair_info_de_cirurgia_de_uma_sala("Sala 2", salas.sala2),
			extrair_info_de_cirurgia_de_uma_sala("Sala 3", salas.sala3),
			extrair_info_de_cirurgia_de_uma_sala("Sala 4", salas.sala4),
			extrair_info_de_cirurgia_de_uma_sala("Sala 5", salas.sala5),
		]);

		return {
			error: false,
			date: salas.date,
			salas: salasParsed,
		};
	} catch (error) {
		console.error(error);
		return {
			error: true,
			message: "Erro ao tentar processar cirurgias do arquivo PDF.",
		};
	}
}
