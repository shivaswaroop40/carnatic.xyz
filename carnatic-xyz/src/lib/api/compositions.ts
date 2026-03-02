const BASE =
	typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

export interface CompositionListItem {
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

export async function fetchCompositions(params?: {
	ragaId?: number;
	composerId?: number;
	type?: string;
	language?: string;
	difficulty?: string;
	sort?: string;
	q?: string;
	limit?: number;
	offset?: number;
}): Promise<{
	compositions: CompositionListItem[];
	pagination: { total: number; limit: number; offset: number; hasMore: boolean };
}> {
	const search = new URLSearchParams();
	if (params?.ragaId != null) search.set("ragaId", String(params.ragaId));
	if (params?.composerId != null)
		search.set("composerId", String(params.composerId));
	if (params?.type) search.set("type", params.type);
	if (params?.language) search.set("language", params.language);
	if (params?.difficulty) search.set("difficulty", params.difficulty);
	if (params?.sort) search.set("sort", params.sort);
	if (params?.q) search.set("q", params.q);
	if (params?.limit != null) search.set("limit", String(params.limit));
	if (params?.offset != null) search.set("offset", String(params.offset));
	const res = await fetch(`${BASE}/api/compositions?${search.toString()}`);
	if (!res.ok) throw new Error("Failed to fetch compositions");
	return res.json();
}

export async function fetchCompositionBySlug(slug: string) {
	const res = await fetch(
		`${BASE}/api/compositions/${encodeURIComponent(slug)}`,
	);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("Failed to fetch composition");
	return res.json();
}

/** Compositions in a given raga (by raga slug). */
export async function fetchCompositionsByRagaSlug(ragaSlug: string): Promise<{
	compositions: CompositionListItem[];
}> {
	const res = await fetch(
		`${BASE}/api/compositions/by-raga/${encodeURIComponent(ragaSlug)}`,
	);
	if (!res.ok) throw new Error("Failed to fetch compositions for raga");
	return res.json();
}

export async function fetchComposers(params?: {
	limit?: number;
	offset?: number;
}): Promise<{
	composers: Array<{ id: number; name: string; slug: string }>;
	pagination: { total: number; limit: number; offset: number; hasMore: boolean };
}> {
	const search = new URLSearchParams();
	if (params?.limit != null) search.set("limit", String(params.limit));
	if (params?.offset != null) search.set("offset", String(params.offset));
	const res = await fetch(`${BASE}/api/composers?${search.toString()}`);
	if (!res.ok) throw new Error("Failed to fetch composers");
	return res.json();
}

export async function fetchComposerBySlug(slug: string) {
	const res = await fetch(
		`${BASE}/api/composers/${encodeURIComponent(slug)}`,
	);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("Failed to fetch composer");
	return res.json();
}
