import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { compositions, annotations } from "../../../../../../drizzle/schema";
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
		const [comp] = await db
			.select()
			.from(compositions)
			.where(eq(compositions.slug, slug))
			.limit(1);
		if (!comp) {
			return NextResponse.json(
				{ error: "Composition not found" },
				{ status: 404 },
			);
		}
		const list = await db
			.select()
			.from(annotations)
			.where(eq(annotations.compositionId, comp.id))
			.orderBy(desc(annotations.upvotes));
		return NextResponse.json({ annotations: list });
	} catch (error) {
		console.error("Error fetching annotations:", error);
		return NextResponse.json(
			{ error: "Failed to fetch annotations" },
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
	const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
	const lineNumber = typeof body.lineNumber === "number" ? body.lineNumber : parseInt(String(body.lineNumber), 10);
	const annotation =
		typeof body.annotation === "string" ? body.annotation.trim() : "";
	const username =
		typeof body.username === "string" && body.username.trim()
			? body.username.trim()
			: "user";
	if (!Number.isInteger(lineNumber) || lineNumber < 0 || !annotation || annotation.length > 2000) {
		return NextResponse.json(
			{ error: "Valid lineNumber and annotation required (max 2000 chars)" },
			{ status: 400 },
		);
	}
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	try {
		const [comp] = await db
			.select()
			.from(compositions)
			.where(eq(compositions.slug, slug))
			.limit(1);
		if (!comp) {
			return NextResponse.json(
				{ error: "Composition not found" },
				{ status: 404 },
			);
		}
		const now = new Date();
		const [inserted] = await db
			.insert(annotations)
			.values({
				compositionId: comp.id,
				userId,
				username,
				lineNumber,
				annotation,
				createdAt: now,
			})
			.returning();
		return NextResponse.json(inserted, { status: 201 });
	} catch (error) {
		console.error("Error posting annotation:", error);
		return NextResponse.json(
			{ error: "Failed to post annotation" },
			{ status: 500 },
		);
	}
}
