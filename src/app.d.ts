// See https://kit.svelte.dev/docs/types#app

import type { ObjectId } from "mongodb";

// for information about these interfaces
declare global {
	interface Session {
		userId: ObjectId;
		createdAt: Date;
		expiresAt: Date;
		lastUsed: Date;
		userAgent: string;
		ip: string;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			session: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: "error" | "success";
				text: string;
			};
		}
	}
}

export {};
