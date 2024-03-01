import { bunnyApiKey } from "$lib/server/environment/environment";
import axios, { isAxiosError } from "axios";

const bunnyClient = axios.create({
	baseURL: "https://br.storage.bunnycdn.com/peus-storage",
	headers: {
		AccessKey: bunnyApiKey,
	},
});

export async function uploadFile(file: File, filePath: string, fileName: string): Promise<boolean> {
	try {
		const fileBuffer = await file.arrayBuffer();
		await bunnyClient.put(`/${filePath}/${fileName}`, fileBuffer, {
			headers: {
				"Content-Type": file.type,
			},
		});
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

interface GetFileSuccess {
	error: false;
	file: File;
}

interface GetFileError {
	error: true;
	message: string;
	status: number;
}

export async function getFile(
	filePath: string,
	fileName: string,
): Promise<GetFileSuccess | GetFileError> {
	try {
		const { data } = await bunnyClient.get<File>(`/${filePath}/${fileName}`, {
			responseType: "stream",
		});
		return { error: false, file: data };
	} catch (error) {
		console.error(error);
		if (isAxiosError(error)) {
			return {
				error: true,
				message: error.message,
				status: error.response?.status ? error.response?.status : 503,
			};
		}
		return { error: true, message: "Erro ao tentar obter arquivo", status: 503 };
	}
}
