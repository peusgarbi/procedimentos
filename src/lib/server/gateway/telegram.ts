import { telegramBotKey, telegramChatId } from "$lib/server/environment/environment";
import axios from "axios";

const telegramBotClient = axios.create({
	baseURL: `https://api.telegram.org/bot${telegramBotKey}`,
});

type SendMessageReturn = {
	result: {
		message_id: number;
	};
};

export async function sendMessage(text: string): Promise<number> {
	try {
		const { data } = await telegramBotClient.get<SendMessageReturn>("/sendMessage", {
			params: {
				chat_id: telegramChatId,
				text,
			},
		});
		return data.result.message_id;
	} catch (error) {
		console.error(error);
		return 0;
	}
}

export async function editMessage(message_id: number, text: string): Promise<boolean> {
	try {
		await telegramBotClient.get("/editMessageText", {
			params: {
				chat_id: telegramChatId,
				message_id,
				text,
			},
		});
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
