import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { composers } from "../../../../../drizzle/schema";
import { compositions } from "../../../../../drizzle/schema";
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
		const [composer] = await db
			.select()
			.from(composers)
			.where(eq(composers.slug, slug))
			.limit(1);
		if (!composer) {
			return NextResponse.json(
				{ error: "Composer not found" },
				{ status: 404 },
			);
		}
		const works = await db
			.select()
			.from(compositions)
			.where(eq(compositions.composerId, composer.id))
			.limit(100);
		return NextResponse.json({ composer, compositions: works });
	} catch (error) {
		console.error("Error fetching composer:", error);
		return NextResponse.json(
			{ error: "Failed to fetch composer" },
			{ status: 500 },
		);
	}
}
