import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { userAudios } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const idNum = parseInt(id, 10);
	if (!Number.isFinite(idNum)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	try {
		const [audio] = await db
			.select()
			.from(userAudios)
			.where(eq(userAudios.id, idNum))
			.limit(1);
		if (!audio || !audio.isPublic) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}
		return NextResponse.json(audio);
	} catch (error) {
		console.error("Error fetching audio:", error);
		return NextResponse.json(
			{ error: "Failed to fetch audio" },
			{ status: 500 },
		);
	}
}
