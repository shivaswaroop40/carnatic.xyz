"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RagaFilters, type RagaFiltersState } from "@/components/ragas/RagaFilters";
import { RagaGrid } from "@/components/ragas/RagaGrid";
import { Pagination, DEFAULT_PAGE_SIZE } from "@/components/Pagination";

export interface RagaRow {
	id: number;
	name: string;
	slug: string;
	type: string;
	description: string | null;
	prahar: string | null;
	rasa: string | null;
}

interface RagasClientProps {
	initialRagas: RagaRow[];
	initialPagination: { total: number; limit: number; offset: number; hasMore: boolean };
}

export function RagasClient({
	initialRagas,
	initialPagination,
}: RagasClientProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const type = searchParams.get("type") || "";
	const sort = searchParams.get("sort") || "name";
	const q = searchParams.get("q") || "";
	const limit = Math.min(
		100,
		Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10)),
	);

	const filters: RagaFiltersState = { type, sort, q };

	function updateFilters(next: RagaFiltersState) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("type", next.type || "");
		params.set("sort", next.sort);
		params.set("q", next.q || "");
		params.set("offset", "0");
		router.replace(`${pathname}?${params.toString()}`);
	}

	const queryParams: Record<string, string> = {};
	if (filters.type) queryParams.type = filters.type;
	if (filters.sort) queryParams.sort = filters.sort;
	if (filters.q) queryParams.q = filters.q;

	return (
		<div className="container mx-auto py-8">
			<h1 className="font-heading mb-6 text-3xl font-bold text-foreground">Ragas</h1>
			<div className="grid gap-8 lg:grid-cols-[240px_1fr]">
				<aside className="lg:border-r lg:pr-6">
					<RagaFilters value={filters} onChange={updateFilters} />
				</aside>
				<div>
					<RagaGrid ragas={initialRagas} />
					{initialPagination.total > limit && (
						<Pagination
							total={initialPagination.total}
							limit={initialPagination.limit}
							offset={initialPagination.offset}
							basePath="/ragas"
							queryParams={queryParams}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
