import { Suspense } from "react";
import { getRagasFromDb } from "@/lib/data-server";
import { RagasClient } from "./RagasClient";

const DEFAULT_PAGE_SIZE = 25;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function RagasPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;
	const type = typeof params?.type === "string" ? params.type : "";
	const sort = typeof params?.sort === "string" ? params.sort : "name";
	const q = typeof params?.q === "string" ? params.q : "";
	const limit = Math.min(
		Math.max(parseInt(typeof params?.limit === "string" ? params.limit : "25", 10) || 25, 1),
		100,
	);
	const offset = Math.max(
		parseInt(typeof params?.offset === "string" ? params.offset : "0", 10) || 0,
		0,
	);

	const { ragas, pagination } = await getRagasFromDb({
		type: type || undefined,
		sort,
		q: q.trim() || undefined,
		limit,
		offset,
	});

	return (
		<Suspense
			fallback={
				<div className="container mx-auto py-8">
					<p className="text-muted-foreground">Loading ragas…</p>
				</div>
			}
		>
			<RagasClient initialRagas={ragas} initialPagination={pagination} />
		</Suspense>
	);
}
