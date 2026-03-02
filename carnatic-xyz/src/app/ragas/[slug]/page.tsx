"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScaleDisplay } from "@/components/ragas/ScaleDisplay";
import { ReviewsList } from "@/components/ragas/ReviewsList";
import {
	fetchRagaBySlug,
	fetchRagaComments,
	type RagaComment,
} from "@/lib/api/ragas";
import { fetchCompositionsByRagaSlug } from "@/lib/api/compositions";

interface RagaDetail {
	id: number;
	name: string;
	slug: string;
	melakarta: string | null;
	arohanam: string;
	avarohanam: string;
	type: string;
	prahar: string | null;
	rasa: string | null;
	description: string | null;
	characteristicPhrases: string | null;
}

interface CompItem {
	id: number;
	title: string;
	slug: string;
	tala: string | null;
	type?: string;
}

export default function RagaDetailPage() {
	const params = useParams();
	const slug = typeof params.slug === "string" ? params.slug : "";
	const [raga, setRaga] = useState<RagaDetail | null>(null);
	const [comments, setComments] = useState<RagaComment[]>([]);
	const [compositions, setCompositions] = useState<CompItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) return;
		let cancelled = false;
		setLoading(true);
		Promise.all([
			fetchRagaBySlug(slug),
			fetchRagaComments(slug).then((r) => r.comments),
			fetchCompositionsByRagaSlug(slug).then((r) => r.compositions),
		])
			.then(([r, c, comps]) => {
				if (!cancelled) {
					setRaga((r && typeof r === "object" && "slug" in r) ? (r as RagaDetail) : null);
					setComments(c ?? []);
					setCompositions(Array.isArray(comps) ? comps : []);
					if (!r) setError("Raga not found");
				}
			})
			.catch((e) => {
				if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [slug]);

	if (loading) return <div className="container mx-auto py-8">Loading…</div>;
	if (error || !raga) {
		return (
			<div className="container mx-auto py-8">
				<p className="text-destructive">{error || "Raga not found"}</p>
				<Link href="/ragas" className="text-primary mt-2 inline-block underline">
					Back to Ragas
				</Link>
			</div>
		);
	}

	const phrases = raga.characteristicPhrases
		? (JSON.parse(raga.characteristicPhrases) as string[]).filter(
				Boolean,
			)
		: [];

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex flex-wrap items-center gap-2">
				<Link
					href="/ragas"
					className="text-muted-foreground hover:text-foreground text-sm underline"
				>
					← Ragas
				</Link>
			</div>
			<header className="mb-8">
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="font-heading text-3xl font-bold text-foreground">{raga.name}</h1>
					<Badge variant={raga.type === "melakarta" ? "default" : "secondary"}>
						{raga.type}
					</Badge>
					{raga.prahar && (
						<Badge variant="outline">{raga.prahar}</Badge>
					)}
					{raga.rasa && (
						<Badge variant="outline">{raga.rasa}</Badge>
					)}
				</div>
			</header>

			<div className="grid gap-8 lg:grid-cols-2">
				<div className="space-y-6">
					<ScaleDisplay
						arohanam={raga.arohanam}
						avarohanam={raga.avarohanam}
					/>
					{compositions.length > 0 && (
						<div>
							<h2 className="font-heading mb-3 text-lg font-semibold text-foreground">
								Compositions in this raga
							</h2>
							<ul className="space-y-2">
								{compositions.map((c) => (
									<li key={c.id}>
										<Link
											href={`/compositions/${c.slug}`}
											className="text-primary hover:underline"
										>
											{c.title}
										</Link>
										{(c.tala || c.type) && (
											<span className="text-muted-foreground text-sm ml-2">
												{c.type ?? "kriti"}
												{c.tala ? ` · ${c.tala}` : ""}
											</span>
										)}
									</li>
								))}
							</ul>
						</div>
					)}
					{raga.description && (
						<div>
							<h2 className="font-heading mb-2 text-lg font-semibold">Description</h2>
							<p className="text-muted-foreground">{raga.description}</p>
						</div>
					)}
					{raga.melakarta && (
						<p className="text-muted-foreground text-sm">
							Parent melakarta: {raga.melakarta}
						</p>
					)}
					{phrases.length > 0 && (
						<div>
							<h2 className="font-heading mb-2 text-lg font-semibold">
								Characteristic phrases
							</h2>
							<ul className="list-inside list-disc space-y-1 font-mono text-sm">
								{phrases.map((p, i) => (
									<li key={i}>{p}</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<div>
					<ReviewsList slug={raga.slug} initialComments={comments} />
				</div>
			</div>
		</div>
	);
}
