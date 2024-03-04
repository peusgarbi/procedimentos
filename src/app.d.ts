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

	interface Task {
		name: string;
		description: string;
		priority: "LOW" | "MEDIUM" | "HIGH";
		dueDate: Date | null;
		createdAt: Date;
		completedAt: Date | null;
		telegramMessageId: number | undefined;
	}

	interface Ponto {
		userId: ObjectId;
		entryTimestamp: Date;
		exitTimestamp: Date | null;
		type: "WORK";
	}

	interface Admission {
		hospital: string;
		identification: string;
		responsableDoctor: string;
		bed: string;
		medications: string;
		diagnosticHypothesis: string;
		history: string;
		personalBackground: string;
		proceduresPerformed: string;
		clinicalExamination: string;
		imaging: string;
		labs: string;
		therapeuticPlan: string;
		evolutions: string[];
		discharged: boolean;
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
