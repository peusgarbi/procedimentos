// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	interface Session {
		createdAt: Date;
		expiresAt: Date;
		lastUsed: Date;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			session: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
