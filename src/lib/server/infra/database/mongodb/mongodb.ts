import { mongodbConnectionString } from "$lib/server/environment/environment";
import { MongoClient } from "mongodb";

interface GetMongoDbSuccess {
	error: false;
	client: MongoClient;
}

interface GetMongoDbError {
	error: true;
	message: string;
}

export async function getMongoDb(): Promise<GetMongoDbSuccess | GetMongoDbError> {
	const client = new MongoClient(mongodbConnectionString);
	try {
		await client.connect();
		return { error: false, client: client };
	} catch (error) {
		console.error(error);
		return { error: true, message: "Erro ao tentar se conectar ao banco de dados" };
	}
}
