import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { ragas, comments } from "../../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const { env } = await getCloudflareContext({ async: true });
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
		const list = await db
			.select()
			.from(comments)
			.where(
				and(
					eq(comments.targetType, "raga"),
					eq(comments.targetId, raga.id),
				),
			)
			.orderBy(desc(comments.createdAt));
		return NextResponse.json({ comments: list });
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { slug } = await params;
	const raw = await request.json();
	const body = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
	const bodyText =
		typeof body.body === "string" ? body.body.trim() : "";
	if (!bodyText || bodyText.length > 5000) {
		return NextResponse.json(
			{ error: "Comment body required (max 5000 chars)" },
			{ status: 400 },
		);
	}
	const username =
		typeof body.username === "string" && body.username.trim()
			? body.username.trim()
			: "user";
	const { env } = await getCloudflareContext({ async: true });
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
		const now = new Date();
		const [inserted] = await db
			.insert(comments)
			.values({
				userId,
				username,
				targetType: "raga",
				targetId: raga.id,
				body: bodyText,
				createdAt: now,
			})
			.returning();
		return NextResponse.json(inserted, { status: 201 });
	} catch (error) {
		console.error("Error posting comment:", error);
		return NextResponse.json(
			{ error: "Failed to post comment" },
			{ status: 500 },
		);
	}
}
