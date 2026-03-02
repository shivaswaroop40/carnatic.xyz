"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionRow {
	id: number;
	title: string;
	slug: string;
	username: string;
	upvotes: number | null;
	answerCount: number | null;
	views: number | null;
	createdAt: string;
}

export default function LearnQuestionsPage() {
	const [questions, setQuestions] = useState<QuestionRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [sort, setSort] = useState("recent");

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		fetch(`/api/questions?sort=${sort}&limit=30`)
			.then((r) => r.json())
			.then((d: unknown) => {
				const data = d as { questions?: QuestionRow[] };
				if (!cancelled) setQuestions(data.questions ?? []);
			})
			.catch(() => {})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [sort]);

	return (
		<div className="container mx-auto py-8">
			<Link
				href="/learn"
				className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm underline"
			>
				← Learning Hub
			</Link>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">Q&A</h1>
				<Link
					href="/learn/questions/ask"
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					Ask question
				</Link>
			</div>
			<div className="mb-4">
				<Select value={sort} onValueChange={setSort}>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="recent">Recent</SelectItem>
						<SelectItem value="popular">Popular</SelectItem>
						<SelectItem value="views">Most viewed</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{loading ? (
				<p className="text-muted-foreground">Loading…</p>
			) : questions.length === 0 ? (
				<p className="text-muted-foreground">No questions yet.</p>
			) : (
				<ul className="space-y-3">
					{questions.map((q) => (
						<li key={q.id}>
							<Link
								href={`/learn/questions/${q.slug}`}
								className="block rounded-lg border p-4 hover:bg-muted/50"
							>
								<h2 className="font-medium">{q.title}</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									{q.username} · {q.upvotes ?? 0} votes · {(q.answerCount ?? 0)} answers
								</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
