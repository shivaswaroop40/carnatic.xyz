"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, DEFAULT_PAGE_SIZE } from "@/components/Pagination";

const DEFAULT_SORT = "views";

export interface CompositionRow {
	id: number;
	title: string;
	slug: string;
	composerId: number;
	ragaId: number | null;
	tala: string | null;
	type: string;
	language: string;
	difficulty: string | null;
	views: number | null;
	likes: number | null;
}

interface CompositionsClientProps {
	initialCompositions: CompositionRow[];
	initialPagination: { total: number; limit: number; offset: number; hasMore: boolean };
	composers: Array<{ id: number; name: string; slug: string }>;
}

export function CompositionsClient({
	initialCompositions,
	initialPagination,
	composers,
}: CompositionsClientProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10)));
	const sort = searchParams.get("sort") || DEFAULT_SORT;
	const q = searchParams.get("q") || "";
	const composerId = searchParams.get("composerId") || "";
	const type = searchParams.get("type") || "";

	function updateFilters(updates: { sort?: string; q?: string; composerId?: string; type?: string }) {
		const params = new URLSearchParams(searchParams.toString());
		if (updates.sort !== undefined) {
			params.set("sort", updates.sort);
			params.set("offset", "0");
		}
		if (updates.q !== undefined) params.set("q", updates.q);
		if (updates.q !== undefined) params.set("offset", "0");
		if (updates.composerId !== undefined) {
			params.set("composerId", updates.composerId);
			params.set("offset", "0");
		}
		if (updates.type !== undefined) {
			params.set("type", updates.type);
			params.set("offset", "0");
		}
		router.replace(`${pathname}?${params.toString()}`);
	}

	const queryParams: Record<string, string> = {};
	if (sort) queryParams.sort = sort;
	if (q) queryParams.q = q;
	if (composerId) queryParams.composerId = composerId;
	if (type) queryParams.type = type;

	return (
		<div className="container mx-auto py-8">
			<h1 className="font-heading mb-6 text-3xl font-bold text-foreground">Compositions</h1>
			<div className="mb-6 flex flex-wrap gap-4">
				<div>
					<Label>Search</Label>
					<Input
						className="mt-1 w-48"
						placeholder="Title..."
						value={q}
						onChange={(e) => updateFilters({ q: e.target.value })}
					/>
				</div>
				<div>
					<Label>Composer</Label>
					<Select
						value={composerId || "all"}
						onValueChange={(v) => updateFilters({ composerId: v === "all" ? "" : v })}
					>
						<SelectTrigger className="mt-1 w-48">
							<SelectValue placeholder="All" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All composers</SelectItem>
							{composers.map((c) => (
								<SelectItem key={c.id} value={String(c.id)}>
									{c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Type</Label>
					<Select
						value={type || "all"}
						onValueChange={(v) => updateFilters({ type: v === "all" ? "" : v })}
					>
						<SelectTrigger className="mt-1 w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="kriti">Kriti</SelectItem>
							<SelectItem value="varnam">Varnam</SelectItem>
							<SelectItem value="keertana">Keertana</SelectItem>
							<SelectItem value="padam">Padam</SelectItem>
							<SelectItem value="tillana">Tillana</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Sort</Label>
					<Select value={sort} onValueChange={(v) => updateFilters({ sort: v })}>
						<SelectTrigger className="mt-1 w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="views">Popularity</SelectItem>
							<SelectItem value="title">Title</SelectItem>
							<SelectItem value="createdAt">Newest</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="overflow-x-auto rounded-md border">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-muted/50">
							<th className="p-3 text-left font-medium">Title</th>
							<th className="p-3 text-left font-medium">Type</th>
							<th className="p-3 text-left font-medium">Language</th>
							<th className="p-3 text-left font-medium">Difficulty</th>
						</tr>
					</thead>
					<tbody>
						{initialCompositions.length === 0 ? (
							<tr>
								<td colSpan={4} className="text-muted-foreground p-6 text-center">
									No compositions match your filters.
								</td>
							</tr>
						) : (
							initialCompositions.map((c) => (
								<tr key={c.id} className="border-b hover:bg-muted/30">
									<td className="p-3">
										<Link
											href={`/compositions/${c.slug}`}
											className="font-heading font-medium text-primary hover:underline underline-offset-2"
										>
											{c.title}
										</Link>
									</td>
									<td className="p-3">{c.type}</td>
									<td className="p-3">{c.language}</td>
									<td className="p-3">{c.difficulty ?? "—"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			{initialPagination.total > limit && (
				<Pagination
					total={initialPagination.total}
					limit={initialPagination.limit}
					offset={initialPagination.offset}
					basePath="/compositions"
					queryParams={queryParams}
				/>
			)}
		</div>
	);
}
