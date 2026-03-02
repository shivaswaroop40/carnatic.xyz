"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_EMAIL = "contact-me@shivu.io";

export function ContactForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus("sending");
		setErrorMsg("");
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim() || undefined,
					email: email.trim() || undefined,
					message: message.trim(),
				}),
			});
			const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
			if (res.ok && data.ok) {
				setStatus("sent");
				setName("");
				setEmail("");
				setMessage("");
			} else {
				setStatus("error");
				setErrorMsg(data.error || "Failed to send.");
			}
		} catch {
			setStatus("error");
			setErrorMsg("Network error. Please try again or email directly.");
		}
	}

	return (
		<div className="container mx-auto max-w-lg py-8">
			<h1 className="font-heading mb-2 text-3xl font-bold text-foreground">
				Contact
			</h1>
			<p className="text-muted-foreground mb-6">
				Have a question or feedback? Reach out by email or use the suggestion form below.
			</p>

			<div className="mb-8 flex items-center gap-2">
				<Mail className="size-5 text-muted-foreground" />
				<a
					href={`mailto:${CONTACT_EMAIL}`}
					className="font-medium text-primary hover:underline underline-offset-2"
				>
					{CONTACT_EMAIL}
				</a>
			</div>

			<section className="rounded-lg border border-border bg-card p-6">
				<h2 className="font-heading mb-4 text-lg font-semibold text-foreground">
					Send a suggestion
				</h2>
				{status === "sent" ? (
					<p className="text-muted-foreground">
						Thanks! Your suggestion has been sent. I’ll get back to you if needed.
					</p>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="contact-name">Name (optional)</Label>
							<Input
								id="contact-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
								className="mt-1"
								disabled={status === "sending"}
							/>
						</div>
						<div>
							<Label htmlFor="contact-email">Email (optional)</Label>
							<Input
								id="contact-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="mt-1"
								disabled={status === "sending"}
							/>
						</div>
						<div>
							<Label htmlFor="contact-message">Suggestion *</Label>
							<Textarea
								id="contact-message"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Your idea, feedback, or request..."
								className="mt-1 min-h-32"
								required
								disabled={status === "sending"}
							/>
						</div>
						{errorMsg && (
							<p className="text-destructive text-sm">{errorMsg}</p>
						)}
						{status === "error" && (
							<p className="text-muted-foreground text-sm">
								You can also email directly at{" "}
								<Link href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
									{CONTACT_EMAIL}
								</Link>
								.
							</p>
						)}
						<Button type="submit" disabled={status === "sending" || !message.trim()}>
							{status === "sending" ? "Sending…" : "Send suggestion"}
						</Button>
					</form>
				)}
			</section>
		</div>
	);
}
