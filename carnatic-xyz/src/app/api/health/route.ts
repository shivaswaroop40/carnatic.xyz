import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

/**
 * Health check: verifies Cloudflare context and D1 are available.
 * GET /api/health → { ok, hasEnv, hasDb, error? }
 */
export async function GET() {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const hasEnv = !!env;
		const hasDb = !!env?.DB;
		if (!hasDb) {
			return NextResponse.json(
				{ ok: false, hasEnv, hasDb: false, error: "env.DB missing" },
				{ status: 500 },
			);
		}
		// Minimal D1 query to confirm DB is usable
		const result = await env.DB.prepare("SELECT 1 as one").first();
		const dbOk = result?.one === 1;
		return NextResponse.json({
			ok: dbOk,
			hasEnv,
			hasDb: true,
			dbOk,
		});
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		return NextResponse.json(
			{ ok: false, error, stack: e instanceof Error ? e.stack : undefined },
			{ status: 500 },
		);
	}
}
