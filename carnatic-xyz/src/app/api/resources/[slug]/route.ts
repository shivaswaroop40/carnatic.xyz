import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { resources } from "../../../../../drizzle/schema";
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
		const [r] = await db
			.select()
			.from(resources)
			.where(eq(resources.slug, slug))
			.limit(1);
		if (!r) {
			return NextResponse.json(
				{ error: "Resource not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json(r);
	} catch (error) {
		console.error("Error fetching resource:", error);
		return NextResponse.json(
			{ error: "Failed to fetch resource" },
			{ status: 500 },
		);
	}
}
