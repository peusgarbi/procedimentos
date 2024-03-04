import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { editMessage } from "$lib/server/gateway/telegram";
import type { Actions, PageServerLoad } from "./$types";
import { ObjectId, type Filter } from "mongodb";
import { error, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.userId) {
		redirect(302, "/auth/login");
	}

	const mongoDbReturn = await getMongoDb();
	if (mongoDbReturn.error) {
		error(500, "Erro ao tentar conectar com o banco de dados");
	}

	const completed = url.searchParams.get("completed");
	const filter: Filter<Task> = {};
	if (completed === "true") {
		filter.completed = true;
	} else if (completed === "false") {
		filter.completed = false;
	}

	const tasksCollection = mongoDbReturn.client.db("procedimentos").collection<Task>("tasks");
	const unparsedTasks = await tasksCollection.find(filter).toArray();
	const tasks = unparsedTasks.map((value) => ({
		...value,
		_id: value._id.toHexString(),
	}));

	return {
		tasks,
		completed,
	};
};

export const actions: Actions = {
	makeQuery: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		const completed = url.searchParams.get("completed");
		url.searchParams.set("completed", completed || "all");
		redirect(302, url);
	},
	switchTaskState: async ({ locals, url }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}

		const taskId = url.searchParams.get("taskId");
		if (!taskId) {
			error(404, "ID Inválido");
		}
		const isValidObjectId = ObjectId.isValid(taskId);
		if (!isValidObjectId) {
			error(404, "ID Inválido");
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar conectar com o banco de dados");
		}
		const tasksCollection = mongoDbReturn.client.db("procedimentos").collection<Task>("tasks");
		const currentTaskState = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
		if (!currentTaskState) {
			error(404, "Tarefa não encontrada, impossível atualizar");
		}

		if (currentTaskState.telegramMessageId) {
			await editMessage(
				currentTaskState.telegramMessageId,
				`TAREFA CRIADA\n
			- NOME: ${currentTaskState.name}
			- DESCRIÇÃO: ${currentTaskState.description}
			- PRIORIDADE: ${currentTaskState.priority}
			- CRIADA EM: ${DateTime.fromJSDate(new Date(), {
				zone: "America/Sao_Paulo",
			})
				.setLocale("pt-BR")
				.toFormat("dd/MM/yyyy - HH:mm:ss")}
			- REALIZAR ATÉ: ${
				currentTaskState.dueDate
					? DateTime.fromJSDate(currentTaskState.dueDate, {
							zone: "America/Sao_Paulo",
						})
							.setLocale("pt-BR")
							.toFormat("dd/MM/yyyy - HH:mm:ss")
					: "Não informado"
			}\n
			${currentTaskState.completedAt ? "PENDENTE" : "CONCLUÍDA"}`,
			);
		}

		await tasksCollection.updateOne(
			{ _id: new ObjectId(taskId) },
			{ $set: { completedAt: currentTaskState.completedAt ? null : new Date() } },
		);
	},
};
