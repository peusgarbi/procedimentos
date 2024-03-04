import { env as privateEnv } from "$env/dynamic/private";

export const mongodbConnectionString = privateEnv.MONGODB_CONNECTION_STRING;
export const sessionMaxTimeInSeconds = parseInt(privateEnv.SESSION_MAX_TIME_IN_SECONDS);
export const useSecureCookies = privateEnv.USE_SECURE_COOKIES === "true" ? true : false;
export const bunnyApiKey = privateEnv.BUNNY_API_KEY;
export const telegramBotKey = privateEnv.TELEGRAM_BOT_KEY;
export const telegramChatId = privateEnv.TELEGRAM_GROU_CHAT_ID;
