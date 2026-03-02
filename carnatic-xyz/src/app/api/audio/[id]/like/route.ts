import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { userAudios } from "../../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { id } = await params;
	const idNum = parseInt(id, 10);
	if (!Number.isFinite(idNum)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	try {
		const [audio] = await db
			.select()
			.from(userAudios)
			.where(eq(userAudios.id, idNum))
			.limit(1);
		if (!audio) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}
		const likes = (audio.likes ?? 0) + 1;
		await db
			.update(userAudios)
			.set({ likes })
			.where(eq(userAudios.id, idNum));
		return NextResponse.json({ likes });
	} catch (error) {
		console.error("Error liking audio:", error);
		return NextResponse.json(
			{ error: "Failed to like" },
			{ status: 500 },
		);
	}
}
