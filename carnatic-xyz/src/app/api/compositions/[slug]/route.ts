import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { compositions, ragas } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

/** Make composition record JSON-serializable for Edge (Date, BigInt, undefined) */
function serializeRow(comp: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(comp)) {
		if (v === undefined) continue;
		if (v instanceof Date) {
			out[k] = v.toISOString();
		} else if (typeof v === "bigint") {
			out[k] = String(v);
		} else {
			out[k] = v;
		}
	}
	return out;
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	let env: { DB?: D1Database } | undefined;
	try {
		({ env } = getCloudflareContext());
	} catch (e) {
		console.error("Composition API: no Cloudflare context", e);
		return NextResponse.json(
			{ error: "Service unavailable" },
			{ status: 503 },
		);
	}
	if (!env?.DB) {
		return NextResponse.json(
			{ error: "Database unavailable" },
			{ status: 503 },
		);
	}
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
		const out = serializeRow(comp);
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
