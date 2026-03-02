import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { like } from "drizzle-orm";
import { ragas, compositions, composers, questions } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const url = request.url ? new URL(request.url) : new URL("http://localhost");
	const q = url.searchParams.get("q")?.trim();
	if (!q || q.length < 2) {
		return NextResponse.json({
			ragas: [],
			compositions: [],
			composers: [],
			questions: [],
		});
	}
	const { env } = await getCloudflareContext({ async: true });
	const db = getDb(env.DB);
	const pattern = `%${q}%`;
	try {
		const [ragasList, compsList, composersList, questionsList] = await Promise.all([
			db.select().from(ragas).where(like(ragas.name, pattern)).limit(5),
			db.select().from(compositions).where(like(compositions.title, pattern)).limit(5),
			db.select().from(composers).where(like(composers.name, pattern)).limit(5),
			db.select().from(questions).where(like(questions.title, pattern)).limit(5),
		]);
		return NextResponse.json({
			ragas: ragasList,
			compositions: compsList,
			composers: composersList,
			questions: questionsList,
		});
	} catch (error) {
		console.error("Search error:", error);
		return NextResponse.json(
			{ error: "Search failed" },
			{ status: 500 },
		);
	}
}
