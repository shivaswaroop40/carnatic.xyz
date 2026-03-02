import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const TO_EMAIL = "contact-me@shivu.io";
const RESEND_API = "https://api.resend.com/emails";

export async function POST(request: NextRequest) {
	try {
		const raw = await request.json();
		const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const email = typeof body.email === "string" ? body.email.trim() : "";
		const message = typeof body.message === "string" ? body.message.trim() : "";

		if (!message || message.length < 3) {
			return NextResponse.json(
				{ error: "Please enter a suggestion (at least 3 characters)." },
				{ status: 400 },
			);
		}

		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Contact form is not configured. Please email directly." },
				{ status: 503 },
			);
		}

		const from = process.env.RESEND_FROM ?? "Carnatic.xyz Contact <onboarding@resend.dev>";
		const subject = `[carnatic.xyz] Suggestion${name || email ? ` from ${name || email}` : ""}`;
		const text = [
			name && `Name: ${name}`,
			email && `Email: ${email}`,
			"",
			"Suggestion:",
			message,
		]
			.filter(Boolean)
			.join("\n");
		const html = text.replace(/\n/g, "<br>");

		const res = await fetch(RESEND_API, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: [TO_EMAIL],
				subject,
				text,
				html: `<div style="font-family: sans-serif;">${html}</div>`,
			}),
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			console.error("Resend error:", res.status, err);
			return NextResponse.json(
				{ error: "Failed to send. Please try emailing directly." },
				{ status: 502 },
			);
		}

		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("Contact API error:", e);
		return NextResponse.json(
			{ error: "Something went wrong. Please try again or email directly." },
			{ status: 500 },
		);
	}
}
