"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AskQuestionPage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [username, setUsername] = useState("user");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (title.length < 10 || body.length < 50) {
			setError("Title (min 10) and body (min 50 chars) required");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch("/api/questions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, body, username: username.trim() || "user" }),
			});
			if (!res.ok) {
				const d = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(d.error || "Failed to post");
			}
			const q = (await res.json()) as { slug: string };
			router.push(`/learn/questions/${q.slug}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto max-w-2xl py-8">
			<Link
				href="/learn"
				className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm underline"
			>
				← Learning Hub
			</Link>
			<h1 className="mb-6 text-3xl font-bold">Ask a question</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						className="mt-1"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Brief summary of your question"
						required
					/>
				</div>
				<div>
					<Label htmlFor="body">Body</Label>
					<Textarea
						id="body"
						className="mt-1 min-h-[200px]"
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Provide details (min 50 characters)"
						required
					/>
				</div>
				<div>
					<Label htmlFor="username">Display name</Label>
					<Input
						id="username"
						className="mt-1"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Your name"
					/>
				</div>
				{error && <p className="text-destructive text-sm">{error}</p>}
				<Button type="submit" disabled={submitting}>
					{submitting ? "Posting…" : "Post question"}
				</Button>
			</form>
		</div>
	);
}
