import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { ragas } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

function serializeRaga(row: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(row)) {
		out[k] = v instanceof Date ? v.toISOString() : v;
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
		console.error("Raga API: no Cloudflare context", e);
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
		const [raga] = await db
			.select()
			.from(ragas)
			.where(eq(ragas.slug, slug))
			.limit(1);
		if (!raga) {
			return NextResponse.json({ error: "Raga not found" }, { status: 404 });
		}
		return NextResponse.json(serializeRaga(raga as Record<string, unknown>));
	} catch (error) {
		console.error("Error fetching raga:", error);
		return NextResponse.json(
			{ error: "Failed to fetch raga" },
			{ status: 500 },
		);
	}
}
