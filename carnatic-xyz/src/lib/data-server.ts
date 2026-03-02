/**
 * Server-only data access for pages. Use in Server Components to read from D1
 * without going through API routes (avoids API 500s and CPU limits on first paint).
 * Do not import from client components.
 */
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, desc, asc, like, or, and, count } from "drizzle-orm";
import { ragas, composers, compositions } from "../../drizzle/schema";
import { getDb } from "@/lib/db";

const DEFAULT_PAGE_SIZE = 25;
const MAX_LIMIT = 100;

/** Ensure request is dynamic and get env; returns null if context/DB unavailable. */
async function getEnv(): Promise<{ DB: D1Database } | null> {
	try {
		await cookies(); // Dynamic API first so Next/OpenNext treat route as dynamic
		const { env } = await getCloudflareContext({ async: true });
		if (!env?.DB) return null;
		return env as { DB: D1Database };
	} catch {
		return null;
	}
}

function emptyRagas() {
	return {
		ragas: [],
		pagination: { total: 0, limit: DEFAULT_PAGE_SIZE, offset: 0, hasMore: false },
	};
}

function emptyComposers() {
	return {
		composers: [] as Array<{ id: number; name: string; slug: string }>,
		pagination: { total: 0, limit: 500, offset: 0, hasMore: false },
	};
}

function emptyCompositions() {
	return {
		compositions: [],
		pagination: { total: 0, limit: DEFAULT_PAGE_SIZE, offset: 0, hasMore: false },
	};
}

export async function getRagasFromDb(params?: {
	type?: string;
	sort?: string;
	q?: string;
	limit?: number;
	offset?: number;
}) {
	const env = await getEnv();
	if (!env) return emptyRagas();
	const db = getDb(env.DB);
	const type = params?.type;
	const sortBy = params?.sort || "name";
	const search = params?.q;
	const limit = Math.min(
		Math.max(params?.limit ?? DEFAULT_PAGE_SIZE, 1),
		MAX_LIMIT,
	);
	const offset = Math.max(params?.offset ?? 0, 0);

	const conditions = [];
	if (type) conditions.push(eq(ragas.type, type));
	if (search?.trim()) {
		conditions.push(
			or(
				like(ragas.name, `%${search.trim()}%`),
				like(ragas.description, `%${search.trim()}%`),
			)!,
		);
	}
	const whereClause =
		conditions.length > 0 ? and(...conditions) : undefined;
	const orderBy =
		sortBy === "popular"
			? desc(ragas.totalRatings)
			: asc(ragas.name);

	try {
		const [result, countResult] = await Promise.all([
			db
				.select()
				.from(ragas)
				.where(whereClause)
				.orderBy(orderBy)
				.limit(limit)
				.offset(offset),
			db
				.select({ value: count(ragas.id) })
				.from(ragas)
				.where(whereClause),
		]);
		const total = countResult[0]?.value ?? 0;
		return {
			ragas: result,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + result.length < total,
			},
		};
	} catch {
		return emptyRagas();
	}
}

export async function getComposersFromDb(params?: { limit?: number; offset?: number }) {
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	const limit = Math.min(
		Math.max(params?.limit ?? 500, 1),
		MAX_LIMIT,
	);
	const offset = Math.max(params?.offset ?? 0, 0);

	const [list, countResult] = await Promise.all([
		db
			.select()
			.from(composers)
			.orderBy(asc(composers.name))
			.limit(limit)
			.offset(offset),
		db.select({ value: count(composers.id) }).from(composers),
	]);
	const total = countResult[0]?.value ?? 0;
	return {
		composers: list.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
		pagination: {
			total,
			limit,
			offset,
			hasMore: offset + list.length < total,
		},
	};
}

export async function getCompositionsFromDb(params?: {
	ragaId?: number;
	composerId?: number;
	type?: string;
	language?: string;
	difficulty?: string;
	sort?: string;
	q?: string;
	limit?: number;
	offset?: number;
}) {
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	const sort = params?.sort || "views";
	const limit = Math.min(
		Math.max(params?.limit ?? DEFAULT_PAGE_SIZE, 1),
		MAX_LIMIT,
	);
	const offset = Math.max(params?.offset ?? 0, 0);

	const conditions = [];
	if (params?.ragaId != null)
		conditions.push(eq(compositions.ragaId, params.ragaId));
	if (params?.composerId != null)
		conditions.push(eq(compositions.composerId, params.composerId));
	if (params?.type) conditions.push(eq(compositions.type, params.type));
	if (params?.language)
		conditions.push(eq(compositions.language, params.language));
	if (params?.difficulty)
		conditions.push(eq(compositions.difficulty, params.difficulty));
	if (params?.q?.trim()) {
		conditions.push(
			or(
				like(compositions.title, `%${params.q.trim()}%`),
				like(compositions.lyricsTransliterated, `%${params.q.trim()}%`),
			)!,
		);
	}
	const whereClause =
		conditions.length > 0 ? and(...conditions) : undefined;
	const orderBy =
		sort === "title"
			? asc(compositions.title)
			: sort === "views"
				? desc(compositions.views)
				: desc(compositions.createdAt);

	const [result, countResult] = await Promise.all([
		db
			.select()
			.from(compositions)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset),
		db
			.select({ value: count(compositions.id) })
			.from(compositions)
			.where(whereClause),
	]);
	const total = countResult[0]?.value ?? 0;
	return {
		compositions: result,
		pagination: {
			total,
			limit,
			offset,
			hasMore: offset + result.length < total,
		},
	};
}
