import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, desc, asc, like, or, and, count } from "drizzle-orm";
import { ragas } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const type = url.searchParams.get("type");
	const sortBy = url.searchParams.get("sort") || "name";
	const search = url.searchParams.get("q");
	const limit = Math.min(
		Math.max(parseInt(url.searchParams.get("limit") || "25", 10), 1),
		100,
	);
	const offset = Math.max(
		parseInt(url.searchParams.get("offset") || "0", 10),
		0,
	);

	const cacheKey = `ragas:${type}:${sortBy}:${search ?? ""}:${limit}:${offset}`;
	const cached = env.CACHE ? await env.CACHE.get(cacheKey) : null;
	if (cached) {
		return new NextResponse(cached, {
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300",
			},
		});
	}

	try {
		const conditions = [];
		if (type) {
			conditions.push(eq(ragas.type, type));
		}
		if (search && search.trim()) {
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

		const result = await db
			.select()
			.from(ragas)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);

		const countResult = await db
			.select({ value: count(ragas.id) })
			.from(ragas)
			.where(whereClause);
		const total = countResult[0]?.value ?? 0;

		const response = {
			ragas: result,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + result.length < total,
			},
		};

		const responseStr = JSON.stringify(response);
		if (env.CACHE) {
			await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 300 });
		}

		return NextResponse.json(response, {
			headers: {
				"Cache-Control": "public, max-age=300",
			},
		});
	} catch (error) {
		console.error("Error fetching ragas:", error);
		return NextResponse.json(
			{ error: "Failed to fetch ragas" },
			{ status: 500 },
		);
	}
}
