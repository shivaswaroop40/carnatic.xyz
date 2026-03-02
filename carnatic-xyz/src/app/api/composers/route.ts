import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { asc, count } from "drizzle-orm";
import { composers } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const limit = Math.min(
		Math.max(parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1),
		MAX_LIMIT,
	);
	const offset = Math.max(
		parseInt(url.searchParams.get("offset") || "0", 10),
		0,
	);

	try {
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
		return NextResponse.json({
			composers: list,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + list.length < total,
			},
		});
	} catch (error) {
		console.error("Error fetching composers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch composers" },
			{ status: 500 },
		);
	}
}
