<script lang="ts">
	import { goto } from "$app/navigation";

	export let url: URL;
	export let page: number = parseInt(url.searchParams.get("page") || "1");
	export let per_page: number = parseInt(url.searchParams.get("per_page") || "10");
	export let totalPages: number;
	export let totalCount: number;

	async function previousPage(): Promise<void> {
		const newUrl = url;
		if (page > 1) {
			newUrl.searchParams.set("page", String(page - 1));
		}
		await goto(newUrl, { invalidateAll: true });
	}

	async function nextPage(): Promise<void> {
		const newUrl = url;
		if (page < totalPages) {
			newUrl.searchParams.set("page", String(page + 1));
		}
		await goto(newUrl, { invalidateAll: true });
	}

	async function paginate(goToPage: number): Promise<void> {
		const newUrl = url;
		newUrl.searchParams.set("page", String(goToPage));
		await goto(newUrl, { invalidateAll: true });
	}

	let paginationArray: number[] = [];
	$: if (page < 3) {
		const newPaginationArray: number[] = [];
		for (let i = 1; i <= (totalPages > 5 ? 5 : totalPages); i++) {
			newPaginationArray.push(i);
		}
		paginationArray = newPaginationArray;
	} else if (page > totalPages - 3) {
		const newPaginationArray: number[] = [];
		for (let i = totalPages; i >= totalPages - 4; i--) {
			newPaginationArray.push(i);
			newPaginationArray.sort((a, b) => a - b);
		}
		paginationArray = newPaginationArray;
	} else {
		paginationArray = [page - 2, page - 1, page, page + 1, page + 2];
	}
</script>

<div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
	<div class="flex justify-between flex-1 sm:hidden">
		<button
			on:click={previousPage}
			disabled={page === 1}
			class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-50"
			>Previous</button
		>
		<button
			on:click={nextPage}
			disabled={page === totalPages}
			class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-50"
			>Next</button
		>
	</div>

	<div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
		<div>
			{#if totalCount === 1}
				<p class="text-sm text-gray-700">
					Mostrando
					<span class="font-medium">1</span>
					resultado
				</p>
			{:else}
				<p class="text-sm text-gray-700">
					Mostrando
					<span class="font-medium">{(page - 1) * per_page + 1}</span>
					até
					<span class="font-medium"
						>{(page - 1) * per_page + per_page > totalCount
							? totalCount
							: (page - 1) * per_page + per_page}</span
					>
					de
					<span class="font-medium">{totalCount}</span>
					resultados
				</p>
			{/if}
		</div>

		<div>
			<nav class="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
				<button
					on:click={previousPage}
					disabled={page === 1}
					class="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-50"
				>
					<span class="sr-only">Previous</span>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				{#each paginationArray as paginationNumber}
					{#if page === paginationNumber}
						<button
							on:click={() => paginate(paginationNumber)}
							aria-current="page"
							class="relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
							>{paginationNumber}</button
						>
					{:else}
						<button
							on:click={() => paginate(paginationNumber)}
							aria-current="page"
							class="relative items-center hidden px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
							>{paginationNumber}</button
						>
					{/if}
				{/each}
				<button
					on:click={nextPage}
					disabled={page === totalPages}
					class="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-50"
				>
					<span class="sr-only">Next</span>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</nav>
		</div>
	</div>
</div>
