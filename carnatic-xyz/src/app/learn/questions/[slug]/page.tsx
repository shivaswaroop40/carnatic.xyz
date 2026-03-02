"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function QuestionDetailPage() {
	const params = useParams();
	const slug = typeof params.slug === "string" ? params.slug : "";
	const [question, setQuestion] = useState<Record<string, unknown> | null>(null);
	const [answers, setAnswers] = useState<Array<Record<string, unknown>>>([]);
	const [loading, setLoading] = useState(true);
	const [answerBody, setAnswerBody] = useState("");
	const [answerUsername, setAnswerUsername] = useState("user");
	const [posting, setPosting] = useState(false);

	useEffect(() => {
		if (!slug) return;
		let cancelled = false;
		setLoading(true);
		fetch(`/api/questions/${encodeURIComponent(slug)}/answers`)
			.then((r) => r.json())
			.then((d: unknown) => {
				const data = d as {
					question?: Record<string, unknown>;
					answers?: Array<Record<string, unknown>>;
				};
				if (!cancelled) {
					setQuestion(data.question ?? null);
					setAnswers(data.answers ?? []);
				}
			})
			.catch(() => {})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [slug]);

	const handlePostAnswer = async () => {
		if (answerBody.trim().length < 30) return;
		setPosting(true);
		try {
			const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/answers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					body: answerBody.trim(),
					username: answerUsername.trim() || "user",
				}),
			});
			if (res.ok) {
				const a = (await res.json()) as Record<string, unknown>;
				setAnswers((prev) => [a, ...prev]);
				setAnswerBody("");
			}
		} finally {
			setPosting(false);
		}
	};

	if (loading) return <div className="container mx-auto py-8">Loading…</div>;
	if (!question) {
		return (
			<div className="container mx-auto py-8">
				<p className="text-destructive">Question not found</p>
				<Link href="/learn/questions" className="text-primary mt-2 inline-block underline">
					Back to Q&A
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-3xl py-8">
			<Link
				href="/learn"
				className="text-muted-foreground hover:text-foreground mb-2 inline-block text-sm underline"
			>
				← Learning Hub
			</Link>
			<Link href="/learn/questions" className="text-muted-foreground mb-4 inline-block text-sm underline">
				← Q&A
			</Link>
			<article className="mb-8 rounded-lg border p-6">
				<h1 className="text-2xl font-bold">{String(question.title)}</h1>
				<p className="text-muted-foreground mt-2 text-sm">
					{String(question.username)} · {(question.upvotes as number) ?? 0} votes
				</p>
				<div className="prose prose-sm dark:prose-invert mt-4 max-w-none">
					<p className="whitespace-pre-wrap">{String(question.body)}</p>
				</div>
			</article>
			<h2 className="mb-4 text-xl font-semibold">Answers ({answers.length})</h2>
			<div className="mb-6">
				<Textarea
					className="min-h-[120px]"
					placeholder="Your answer (min 30 characters)"
					value={answerBody}
					onChange={(e) => setAnswerBody(e.target.value)}
				/>
				<Input
					className="mt-2 w-48"
					placeholder="Your name"
					value={answerUsername}
					onChange={(e) => setAnswerUsername(e.target.value)}
				/>
				<Button
					className="mt-2"
					onClick={handlePostAnswer}
					disabled={posting || answerBody.trim().length < 30}
				>
					{posting ? "Posting…" : "Post answer"}
				</Button>
			</div>
			<ul className="space-y-4">
				{answers.map((a) => (
					<li key={String(a.id)} className="rounded-lg border p-4">
						<p className="text-muted-foreground text-sm">
							{String(a.username)} · {(a.upvotes as number) ?? 0} votes
						</p>
						<p className="mt-2 whitespace-pre-wrap text-sm">{String(a.body)}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
