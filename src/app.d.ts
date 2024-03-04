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

	interface Surgery {
		userId: ObjectId;
		surgeryType: string;
		role: string;
		diagnosis: string;
		patient: string;
		startTime: Date;
		endTime: Date;
		durationInSeconds: number;
		createdAt: Date;
		fileExtension: string | null;
	}

	interface User {
		email: string;
		password: string;
	}

	interface Ponto {
		userId: ObjectId;
		entryTimestamp: Date;
		exitTimestamp: Date | null;
		type: "WORK";
	}

	namespace App {
		// interface Error {}
		interface Locals {
			session: boolean;
			userId: ObjectId;
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
