import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { ragas } from "../../../../../../drizzle/schema";
import { compositions } from "../../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ ragaSlug: string }> },
) {
	const { ragaSlug } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	try {
		const [raga] = await db
			.select()
			.from(ragas)
			.where(eq(ragas.slug, ragaSlug))
			.limit(1);
		if (!raga) {
			return NextResponse.json({ error: "Raga not found" }, { status: 404 });
		}
		const list = await db
			.select()
			.from(compositions)
			.where(eq(compositions.ragaId, raga.id))
			.limit(100);
		return NextResponse.json({ compositions: list });
	} catch (error) {
		console.error("Error fetching compositions by raga:", error);
		return NextResponse.json(
			{ error: "Failed to fetch compositions" },
			{ status: 500 },
		);
	}
}
