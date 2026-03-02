import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { compositions, ragas } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	try {
		const [row] = await db
			.select({
				composition: compositions,
				ragaSlug: ragas.slug,
				ragaName: ragas.name,
			})
			.from(compositions)
			.leftJoin(ragas, eq(compositions.ragaId, ragas.id))
			.where(eq(compositions.slug, slug))
			.limit(1);
		if (!row || !row.composition) {
			return NextResponse.json(
				{ error: "Composition not found" },
				{ status: 404 },
			);
		}
		const comp = row.composition as Record<string, unknown>;
		const out = { ...comp };
		if (row.ragaSlug != null) out.ragaSlug = row.ragaSlug;
		if (row.ragaName != null) out.ragaName = row.ragaName;
		return NextResponse.json(out);
	} catch (error) {
		console.error("Error fetching composition:", error);
		return NextResponse.json(
			{ error: "Failed to fetch composition" },
			{ status: 500 },
		);
	}
}
