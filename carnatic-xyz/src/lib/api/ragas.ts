const BASE = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

export interface RagaListItem {
	id: number;
	name: string;
	slug: string;
	type: string;
	description: string | null;
	prahar: string | null;
	rasa: string | null;
}

export interface RagasResponse {
	ragas: RagaListItem[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

export async function fetchRagas(params?: {
	type?: string;
	sort?: string;
	q?: string;
	limit?: number;
	offset?: number;
}): Promise<RagasResponse> {
	const search = new URLSearchParams();
	if (params?.type) search.set("type", params.type);
	if (params?.sort) search.set("sort", params.sort);
	if (params?.q) search.set("q", params.q);
	if (params?.limit != null) search.set("limit", String(params.limit));
	if (params?.offset != null) search.set("offset", String(params.offset));
	const res = await fetch(`${BASE}/api/ragas?${search.toString()}`);
	if (!res.ok) throw new Error("Failed to fetch ragas");
	return res.json();
}

export async function fetchRagaBySlug(slug: string) {
	const res = await fetch(`${BASE}/api/ragas/${encodeURIComponent(slug)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("Failed to fetch raga");
	return res.json();
}

export async function fetchRagaComments(slug: string): Promise<{
	comments: RagaComment[];
}> {
	const res = await fetch(
		`${BASE}/api/ragas/${encodeURIComponent(slug)}/comments`,
	);
	if (!res.ok) throw new Error("Failed to fetch comments");
	return res.json();
}

export type RagaComment = {
	id: number;
	userId: string;
	username: string;
	body: string;
	createdAt: string;
};

export async function postRagaComment(
	slug: string,
	body: string,
	username?: string,
): Promise<unknown> {
	const res = await fetch(
		`${BASE}/api/ragas/${encodeURIComponent(slug)}/comments`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ body, username }),
		},
	);
	if (!res.ok) {
		const data = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(data.error || "Failed to post comment");
	}
	return res.json();
}
