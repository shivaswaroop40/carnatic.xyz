import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { questions, answers } from "../../../../../../drizzle/schema";
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
		const [q] = await db
			.select()
			.from(questions)
			.where(eq(questions.slug, slug))
			.limit(1);
		if (!q) {
			return NextResponse.json(
				{ error: "Question not found" },
				{ status: 404 },
			);
		}
		const list = await db
			.select()
			.from(answers)
			.where(eq(answers.questionId, q.id))
			.orderBy(desc(answers.isAccepted), desc(answers.upvotes));
		return NextResponse.json({ question: q, answers: list });
	} catch (error) {
		console.error("Error fetching answers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch answers" },
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
	const bodyText = typeof body.body === "string" ? body.body.trim() : "";
	const username = typeof body.username === "string" ? body.username : "user";
	if (!bodyText || bodyText.length < 30) {
		return NextResponse.json(
			{ error: "Answer body required (min 30 chars)" },
			{ status: 400 },
		);
	}
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	try {
		const [q] = await db
			.select()
			.from(questions)
			.where(eq(questions.slug, slug))
			.limit(1);
		if (!q) {
			return NextResponse.json(
				{ error: "Question not found" },
				{ status: 404 },
			);
		}
		const now = new Date();
		const [inserted] = await db
			.insert(answers)
			.values({
				questionId: q.id,
				userId,
				username,
				body: bodyText,
				createdAt: now,
				updatedAt: now,
			})
			.returning();
		await db
			.update(questions)
			.set({
				answerCount: (q.answerCount ?? 0) + 1,
				updatedAt: now,
			})
			.where(eq(questions.id, q.id));
		return NextResponse.json(inserted, { status: 201 });
	} catch (error) {
		console.error("Error posting answer:", error);
		return NextResponse.json(
			{ error: "Failed to post answer" },
			{ status: 500 },
		);
	}
}
