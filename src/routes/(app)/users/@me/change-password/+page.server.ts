import { changePasswordFormSchema } from "$lib/server/forms/schemas/changePasswordSchema";
import { getMongoDb } from "$lib/server/infra/database/mongodb/mongodb";
import { message, superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { compareSync, hashSync } from "bcrypt";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.userId) redirect(302, "/auth/login");

	return {
		form: await superValidate(zod(changePasswordFormSchema)),
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session || !locals.userId) {
			redirect(302, "/auth/login");
		}
		const form = await superValidate(request, zod(changePasswordFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const mongoDbReturn = await getMongoDb();
		if (mongoDbReturn.error) {
			error(500, "Erro ao tentar se comunicar com o banco de dados");
		}

		const users = mongoDbReturn.client.db("procedimentos").collection<User>("users");
		const user = await users.findOne({ _id: locals.userId });
		if (!user) {
			error(404, "Usuário não encontrado");
		}

		const validCurrentPassword = compareSync(form.data.currentPassword, user.password);
		if (!validCurrentPassword) {
			return message(form, { type: "error", text: "Senha atual incorreta" }, { status: 403 });
		}

		const password = hashSync(form.data.newPassword, 10);
		await users.updateOne({ _id: locals.userId }, { $set: { password } });

		return message(form, { type: "success", text: "Senha alterada com sucesso!" });
	},
};
