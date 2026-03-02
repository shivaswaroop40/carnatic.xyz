import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { questions } from "../../../../../drizzle/schema";
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
		return NextResponse.json(q);
	} catch (error) {
		console.error("Error fetching question:", error);
		return NextResponse.json(
			{ error: "Failed to fetch question" },
			{ status: 500 },
		);
	}
}
