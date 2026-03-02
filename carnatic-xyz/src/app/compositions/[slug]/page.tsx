"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LyricsSyncPlayer } from "@/components/compositions/LyricsSyncPlayer";
import { fetchCompositionBySlug } from "@/lib/api/compositions";

/** Detect section headers: Pallavi, Anupallavi, Charanam 1, Charanaṃ 2, etc. */
const SECTION_HEADER = /^(Pallavi|Anupallavi|Charanam\s*\d*|Charanaṃ\s*\d*|Chorus|Refrain)\s*:?\s*$/i;

function parseLyricsSections(text: string): { title: string; content: string }[] {
	if (!text.trim()) return [];
	const lines = text.split("\n");
	const sections: { title: string; content: string }[] = [];
	let currentTitle = "Lyrics";
	let currentLines: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		const match = trimmed.match(SECTION_HEADER);
		if (match) {
			if (currentLines.length > 0) {
				sections.push({
					title: currentTitle,
					content: currentLines.join("\n").trim(),
				});
			}
			currentTitle = match[1].trim();
			currentLines = [];
		} else {
			currentLines.push(line);
		}
	}
	if (currentLines.length > 0) {
		sections.push({
			title: currentTitle,
			content: currentLines.join("\n").trim(),
		});
	}
	return sections.length > 0 ? sections : [{ title: "Full lyrics", content: text.trim() }];
}

function LyricsWithSections({
	label,
	text,
	className,
}: {
	label: string;
	text: string;
	className?: string;
}) {
	const sections = parseLyricsSections(text);
	return (
		<div className={className}>
			<h3 className="font-heading mb-3 font-semibold text-foreground">{label}</h3>
			<div className="space-y-6">
				{sections.map((sec, i) => (
					<div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{sec.title}
						</p>
						<pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
							{sec.content}
						</pre>
					</div>
				))}
			</div>
		</div>
	);
}

export default function CompositionDetailPage() {
	const params = useParams();
	const slug = typeof params.slug === "string" ? params.slug : "";
	const [comp, setComp] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) return;
		let cancelled = false;
		setLoading(true);
		fetchCompositionBySlug(slug)
			.then((r) => {
				if (!cancelled)
					setComp(
						r && typeof r === "object" ? (r as Record<string, unknown>) : null,
					);
				if (!r) setError("Composition not found");
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
	if (error || !comp) {
		return (
			<div className="container mx-auto py-8">
				<p className="text-destructive">{error || "Not found"}</p>
				<Link href="/compositions" className="text-primary mt-2 inline-block underline">
					Back to Compositions
				</Link>
			</div>
		);
	}

	const title = String(comp.title ?? "");
	const type = String(comp.type ?? "");
	const language = String(comp.language ?? "");
	const difficulty = comp.difficulty ? String(comp.difficulty) : null;
	const ragaSlug = comp.ragaSlug != null ? String(comp.ragaSlug) : null;
	const ragaName = comp.ragaName != null ? String(comp.ragaName) : null;
	const lyricsOriginal = comp.lyricsOriginal ? String(comp.lyricsOriginal) : "";
	const lyricsTransliterated = comp.lyricsTransliterated
		? String(comp.lyricsTransliterated)
		: "";
	const lyricsTranslated = comp.lyricsTranslated
		? String(comp.lyricsTranslated)
		: "";
	const meaning = comp.meaning ? String(comp.meaning) : "";
	const notation = comp.notation ? String(comp.notation) : "";
	const audioUrl = comp.audioUrl ? String(comp.audioUrl) : "";
	const renditionUrlsRaw = comp.renditionUrls;
	const renditionUrls: { url: string; label?: string }[] = (() => {
		if (!renditionUrlsRaw) return [];
		try {
			const parsed = JSON.parse(String(renditionUrlsRaw));
			return Array.isArray(parsed)
				? parsed.filter(
						(u: unknown) =>
							u && typeof u === "object" && "url" in u && typeof (u as { url: unknown }).url === "string",
					)
						.map((u: { url: string; label?: string }) => ({
							url: (u as { url: string }).url,
							label: typeof (u as { label?: string }).label === "string" ? (u as { label: string }).label : undefined,
						}))
				: [];
		} catch {
			return [];
		}
	})();

	const lyricLines = lyricsTransliterated
		? lyricsTransliterated.split("\n").map((text: string, i: number) => ({
				time: i * 5,
				text: text.trim(),
			}))
		: [];

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<Link
					href="/compositions"
					className="text-muted-foreground hover:text-foreground text-sm underline"
				>
					← Compositions
				</Link>
			</div>
			<header className="mb-8">
				<h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
				<div className="mt-2 flex flex-wrap gap-2">
					<Badge variant="secondary">{type}</Badge>
					<Badge variant="outline">{language}</Badge>
					{ragaSlug && ragaName && (
						<Link
							href={`/ragas/${ragaSlug}`}
							className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							Raga: {ragaName}
						</Link>
					)}
					{difficulty && (
						<Badge variant="outline">{difficulty}</Badge>
					)}
				</div>
			</header>

			<Tabs defaultValue="lyrics" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="lyrics">Lyrics</TabsTrigger>
					<TabsTrigger value="notation">Notation</TabsTrigger>
					<TabsTrigger value="meaning">Meaning</TabsTrigger>
					<TabsTrigger value="rendition">Rendition</TabsTrigger>
				</TabsList>
				<TabsContent value="lyrics" className="space-y-8">
					{lyricsOriginal && (
						<LyricsWithSections
							label="Original script"
							text={lyricsOriginal}
						/>
					)}
					{lyricsTransliterated && (
						<LyricsWithSections
							label="Transliteration"
							text={lyricsTransliterated}
						/>
					)}
					{lyricsTranslated && (
						<LyricsWithSections
							label="Translation"
							text={lyricsTranslated}
						/>
					)}
					{!lyricsOriginal && !lyricsTransliterated && !lyricsTranslated && (
						<p className="text-muted-foreground">No lyrics available for this composition.</p>
					)}
				</TabsContent>
				<TabsContent value="notation">
					{notation ? (
						<pre className="whitespace-pre-wrap rounded border bg-muted/30 p-4 font-mono text-sm">
							{notation}
						</pre>
					) : (
						<p className="text-muted-foreground">No notation available.</p>
					)}
				</TabsContent>
				<TabsContent value="meaning">
					{meaning ? (
						<div className="prose prose-sm dark:prose-invert max-w-none">
							<p className="whitespace-pre-wrap">{meaning}</p>
						</div>
					) : (
						<p className="text-muted-foreground">No meaning/commentary available.</p>
					)}
				</TabsContent>
				<TabsContent value="rendition" className="space-y-6">
					{renditionUrls.length > 0 && (
						<div>
							<h3 className="font-heading mb-3 font-semibold text-foreground">Rendition links</h3>
							<ul className="space-y-2">
								{renditionUrls.map((r, i) => (
									<li key={i}>
										<a
											href={r.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{r.label || (r.url.includes("youtube") ? "YouTube" : "Listen")}
										</a>
									</li>
								))}
							</ul>
						</div>
					)}
					{/* Fallback: every composition gets at least one link (YouTube search) */}
					<div>
						<h3 className="font-heading mb-3 font-semibold text-foreground">
							{renditionUrls.length > 0 ? "More" : "Rendition links"}
						</h3>
						<ul className="space-y-2">
							<li>
								<a
									href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title + " carnatic")}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									Search on YouTube for “{title}”
								</a>
							</li>
						</ul>
					</div>
					{audioUrl && (
						<LyricsSyncPlayer
							audioUrl={audioUrl}
							lyrics={lyricLines}
						/>
					)}
					{!renditionUrls.length && !audioUrl && (
						<p className="text-muted-foreground">No in-app audio for this composition.</p>
					)}
				</TabsContent>
			</Tabs>
			<p className="mt-8 text-xs text-muted-foreground border-t border-border pt-6">
				For more lyrics, notations, and translations, see{" "}
				<a
					href="https://www.karnatik.com/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary hover:underline"
				>
					karnATik
				</a>
				. Credits: <Link href="/credits" className="text-primary hover:underline">Credits &amp; sources</Link>.
			</p>
		</div>
	);
}
