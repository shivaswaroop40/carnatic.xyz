import { NextResponse } from "next/server";

export const runtime = "edge";

/** No bindings, no context - just confirm the Worker can run a route. */
export async function GET() {
	return NextResponse.json({ pong: true });
}
