import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, desc } from "drizzle-orm";
import { userAudios } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
	try {
		const result = await db
			.select()
			.from(userAudios)
			.where(eq(userAudios.isPublic, true))
			.orderBy(desc(userAudios.createdAt))
			.limit(limit);
		return NextResponse.json({ uploads: result });
	} catch (error) {
		console.error("Error fetching uploads:", error);
		return NextResponse.json(
			{ error: "Failed to fetch uploads" },
			{ status: 500 },
		);
	}
}
