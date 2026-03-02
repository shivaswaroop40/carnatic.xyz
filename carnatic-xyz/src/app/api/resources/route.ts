import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, asc, and, count } from "drizzle-orm";
import { resources } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const category = url.searchParams.get("category");
	const difficulty = url.searchParams.get("difficulty");
	const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1), MAX_LIMIT);
	const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
	try {
		const conds = [];
		if (category) conds.push(eq(resources.category, category));
		if (difficulty) conds.push(eq(resources.difficulty, difficulty));
		const whereClause = conds.length > 0 ? and(...conds) : undefined;
		const [result, countResult] = await Promise.all([
			db.select().from(resources).where(whereClause).orderBy(asc(resources.order), asc(resources.title)).limit(limit).offset(offset),
			db.select({ value: count(resources.id) }).from(resources).where(whereClause),
		]);
		const total = countResult[0]?.value ?? 0;
		return NextResponse.json({ resources: result, pagination: { total, limit, offset, hasMore: offset + result.length < total } });
	} catch (error) {
		console.error("Error fetching resources:", error);
		return NextResponse.json(
			{ error: "Failed to fetch resources" },
			{ status: 500 },
		);
	}
}
