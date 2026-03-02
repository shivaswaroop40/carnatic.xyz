"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 200;

interface SearchResult {
	ragas: Array<{ id: number; name: string; slug: string }>;
	compositions: Array<{ id: number; title: string; slug: string }>;
	questions: Array<{ id: number; title: string; slug: string }>;
}

export function SearchPopup({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult | null>(null);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (open) {
			setQuery("");
			setResults(null);
			setTimeout(() => inputRef.current?.focus(), 0);
		}
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const q = query.trim();
		if (q.length < 2) {
			setResults(null);
			return;
		}
		const t = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await fetch(`/api/search/global?q=${encodeURIComponent(q)}`);
				const data = (await res.json()) as SearchResult | { error: string };
				if ("error" in data) {
					setResults({ ragas: [], compositions: [], questions: [] });
				} else {
					setResults({
						ragas: data.ragas ?? [],
						compositions: data.compositions ?? [],
						questions: data.questions ?? [],
					});
				}
			} catch {
				setResults({ ragas: [], compositions: [], questions: [] });
			} finally {
				setLoading(false);
			}
		}, DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [query, open]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		},
		[onClose],
	);

	const go = useCallback(
		(href: string) => {
			onClose();
			router.push(href);
		},
		[onClose, router],
	);

	if (!open) return null;

	const hasAny =
		results &&
		(results.ragas.length > 0 ||
			results.compositions.length > 0 ||
			results.questions.length > 0);
	const searched = query.trim().length >= 2;

	return (
		<>
			<div
				className="fixed inset-0 z-50 bg-black/50"
				aria-hidden
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Search"
				className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-background p-4 shadow-xl"
				onKeyDown={handleKeyDown}
			>
				<div className="flex items-center gap-2 border-b border-border pb-3">
					<Search className="size-5 shrink-0 text-muted-foreground" />
					<Input
						ref={inputRef}
						type="search"
						placeholder="Search ragas, compositions, Q&A…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="border-0 p-0 shadow-none focus-visible:ring-0"
						autoComplete="off"
					/>
				</div>
				<div className="mt-3 max-h-[60vh] overflow-y-auto">
					{!searched && (
						<p className="text-muted-foreground text-sm">
							Type at least 2 characters to search.
						</p>
					)}
					{searched && loading && (
						<p className="text-muted-foreground text-sm">Searching…</p>
					)}
					{searched && !loading && results && !hasAny && (
						<p className="text-muted-foreground text-sm">No results found.</p>
					)}
					{searched && !loading && hasAny && results && (
						<div className="space-y-4">
							{results.ragas.length > 0 && (
								<div>
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Ragas
									</h3>
									<ul className="space-y-1">
										{results.ragas.map((r) => (
											<li key={r.id}>
												<Link
													href={`/ragas/${r.slug}`}
													onClick={(e) => {
														e.preventDefault();
														go(`/ragas/${r.slug}`);
													}}
													className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
												>
													{r.name}
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}
							{results.compositions.length > 0 && (
								<div>
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Compositions
									</h3>
									<ul className="space-y-1">
										{results.compositions.map((c) => (
											<li key={c.id}>
												<Link
													href={`/compositions/${c.slug}`}
													onClick={(e) => {
														e.preventDefault();
														go(`/compositions/${c.slug}`);
													}}
													className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
												>
													{c.title}
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}
							{results.questions.length > 0 && (
								<div>
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Q&A
									</h3>
									<ul className="space-y-1">
										{results.questions.map((q) => (
											<li key={q.id}>
												<Link
													href={`/learn/questions/${q.slug}`}
													onClick={(e) => {
														e.preventDefault();
														go(`/learn/questions/${q.slug}`);
													}}
													className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
												>
													{q.title}
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
