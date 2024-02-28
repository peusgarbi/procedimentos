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

const client = new MongoClient(mongodbConnectionString);

export async function getMongoDb(): Promise<GetMongoDbSuccess | GetMongoDbError> {
	try {
		await client.connect();
		return { error: false, client: client };
	} catch (error) {
		console.error(error);
		return { error: true, message: "Erro ao tentar se conectar ao banco de dados" };
	}
}
