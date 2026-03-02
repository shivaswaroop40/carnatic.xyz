import { Suspense } from "react";
import { getCompositionsFromDb, getComposersFromDb } from "@/lib/data-server";
import { CompositionsClient } from "./CompositionsClient";

const DEFAULT_SORT = "views";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CompositionsPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;
	const sort = (typeof params?.sort === "string" ? params.sort : null) || DEFAULT_SORT;
	const q = typeof params?.q === "string" ? params.q : "";
	const composerId = typeof params?.composerId === "string" ? params.composerId : "";
	const type = typeof params?.type === "string" ? params.type : "";
	const limit = Math.min(
		Math.max(parseInt(typeof params?.limit === "string" ? params.limit : "25", 10) || 25, 1),
		100,
	);
	const offset = Math.max(
		parseInt(typeof params?.offset === "string" ? params.offset : "0", 10) || 0,
		0,
	);

	const [compositionsResult, composersResult] = await Promise.all([
		getCompositionsFromDb({
			sort,
			q: q.trim() || undefined,
			composerId: composerId ? parseInt(composerId, 10) : undefined,
			type: type || undefined,
			limit,
			offset,
		}),
		getComposersFromDb({ limit: 500 }),
	]);

	return (
		<Suspense
			fallback={
				<div className="container mx-auto py-8">
					<p className="text-muted-foreground">Loading…</p>
				</div>
			}
		>
			<CompositionsClient
				initialCompositions={compositionsResult.compositions}
				initialPagination={compositionsResult.pagination}
				composers={composersResult.composers}
			/>
		</Suspense>
	);
}
