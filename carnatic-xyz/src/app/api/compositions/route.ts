import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, desc, asc, like, or, and, count } from "drizzle-orm";
import { compositions } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const ragaId = url.searchParams.get("ragaId");
	const composerId = url.searchParams.get("composerId");
	const type = url.searchParams.get("type");
	const language = url.searchParams.get("language");
	const difficulty = url.searchParams.get("difficulty");
	const sort = url.searchParams.get("sort") || "views";
	const q = url.searchParams.get("q");
	const limit = Math.min(
		Math.max(parseInt(url.searchParams.get("limit") || "25", 10), 1),
		100,
	);
	const offset = Math.max(
		parseInt(url.searchParams.get("offset") || "0", 10),
		0,
	);

	const conditions = [];
	if (ragaId) {
		const id = parseInt(ragaId, 10);
		if (Number.isFinite(id)) conditions.push(eq(compositions.ragaId, id));
	}
	if (composerId) {
		const id = parseInt(composerId, 10);
		if (Number.isFinite(id))
			conditions.push(eq(compositions.composerId, id));
	}
	if (type) conditions.push(eq(compositions.type, type));
	if (language) conditions.push(eq(compositions.language, language));
	if (difficulty) conditions.push(eq(compositions.difficulty, difficulty));
	if (q && q.trim()) {
		conditions.push(
			or(
				like(compositions.title, `%${q.trim()}%`),
				like(compositions.lyricsTransliterated, `%${q.trim()}%`),
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

	try {
		const result = await db
			.select()
			.from(compositions)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);
		const countResult = await db
			.select({ value: count(compositions.id) })
			.from(compositions)
			.where(whereClause);
		const total = countResult[0]?.value ?? 0;
		return NextResponse.json({
			compositions: result,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + result.length < total,
			},
		});
	} catch (error) {
		console.error("Error fetching compositions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch compositions" },
			{ status: 500 },
		);
	}
}
