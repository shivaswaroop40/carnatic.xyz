import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@clerk/nextjs/server";
import { desc, like, or, and } from "drizzle-orm";
import { questions } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const sort = url.searchParams.get("sort") || "recent";
	const q = url.searchParams.get("q");
	const tag = url.searchParams.get("tag");
	const limit = Math.min(
		Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1),
		50,
	);
	const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
	const conditions = [];
	if (q && q.trim()) {
		conditions.push(
			or(
				like(questions.title, `%${q.trim()}%`),
				like(questions.body, `%${q.trim()}%`),
			)!,
		);
	}
	if (tag && tag.trim()) {
		conditions.push(like(questions.tags, `%${tag.trim()}%`));
	}
	const whereClause =
		conditions.length > 0 ? and(...conditions) : undefined;
	const orderBy =
		sort === "popular"
			? desc(questions.upvotes)
			: sort === "views"
				? desc(questions.views)
				: desc(questions.createdAt);
	try {
		const result = await db
			.select()
			.from(questions)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);
		return NextResponse.json({ questions: result });
	} catch (error) {
		console.error("Error fetching questions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch questions" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const raw = await request.json();
	const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
	const title = typeof body.title === "string" ? body.title.trim() : "";
	const bodyText = typeof body.body === "string" ? body.body.trim() : "";
	const tagsRaw = body.tags;
	const tags = Array.isArray(tagsRaw)
		? tagsRaw.filter((t): t is string => typeof t === "string").slice(0, 5)
		: [];
	if (!title || title.length < 10 || !bodyText || bodyText.length < 50) {
		return NextResponse.json(
			{ error: "Title (min 10) and body (min 50 chars) required" },
			{ status: 400 },
		);
	}
	const username = typeof body.username === "string" ? body.username : "user";
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const { env } = getCloudflareContext();
	const db = getDb(env.DB);
	const now = new Date();
	try {
		const [inserted] = await db
			.insert(questions)
			.values({
				userId,
				username,
				title,
				slug: slug || `q-${Date.now()}`,
				body: bodyText,
				tags: JSON.stringify(tags),
				createdAt: now,
				updatedAt: now,
			})
			.returning();
		return NextResponse.json(inserted, { status: 201 });
	} catch (error) {
		console.error("Error creating question:", error);
		return NextResponse.json(
			{ error: "Failed to create question" },
			{ status: 500 },
		);
	}
}
