import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
	"/",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/ragas(.*)",
	"/compositions(.*)",
	"/composers(.*)",
	"/learn(.*)",
	"/search(.*)",
	"/community(.*)",
	"/contact(.*)",
	"/api/ragas(.*)",
	"/api/compositions(.*)",
	"/api/composers(.*)",
	"/api/questions(.*)",
	"/api/resources(.*)",
	"/api/search(.*)",
	"/api/ping",
	"/api/health",
	"/api/contact",
]);

function hasValidClerkKey(): boolean {
	const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
	return (
		typeof key === "string" &&
		key.length > 20 &&
		(key.startsWith("pk_test_") || key.startsWith("pk_live_")) &&
		!key.includes("placeholder")
	);
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
	if (!isPublicRoute(request)) {
		await auth.protect();
	}
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
	// When Clerk key is missing (e.g. production without env), pass through to avoid 500s
	if (!hasValidClerkKey()) {
		return NextResponse.next();
	}
	try {
		return await clerkHandler(req, event);
	} catch {
		return NextResponse.next();
	}
}

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|ico|svg|woff2?|map)).*)",
		"/(api|trpc)(.*)",
	],
};
