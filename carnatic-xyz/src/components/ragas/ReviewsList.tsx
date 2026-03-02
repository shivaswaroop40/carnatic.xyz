"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import {
	postRagaComment,
	type RagaComment,
} from "@/lib/api/ragas";
import { useAuthAvailable } from "@/lib/auth-available";

interface ReviewsListProps {
	slug: string;
	initialComments: RagaComment[];
}

/** Read-only comments list when Clerk is not configured */
function ReviewsListReadOnly({
	initialComments,
}: {
	initialComments: RagaComment[];
}) {
	return (
		<div className="space-y-4">
			<h3 className="font-heading text-lg font-semibold">Comments</h3>
			<ul className="space-y-3">
				{initialComments.length === 0 ? (
					<li className="text-muted-foreground text-sm">
						No comments yet.
					</li>
				) : (
					initialComments.map((c) => (
						<li
							key={c.id}
							className="rounded-lg border bg-card p-3 text-card-foreground"
						>
							<p className="text-muted-foreground text-xs">
								{c.username} ·{" "}
								{new Date(c.createdAt).toLocaleDateString()}
							</p>
							<p className="mt-1 text-sm">{c.body}</p>
						</li>
					))
				)}
			</ul>
		</div>
	);
}

/** Full comments list with post form; only rendered when Clerk is available */
function ReviewsListWithAuth({
	slug,
	initialComments,
}: ReviewsListProps) {
	const { isSignedIn } = useAuth();
	const [comments, setComments] =
		useState<RagaComment[]>(initialComments);
	const [newBody, setNewBody] = useState("");
	const [posting, setPosting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePost = async () => {
		const body = newBody.trim();
		if (!body) return;
		if (!isSignedIn) {
			setError("Sign in to comment");
			return;
		}
		setPosting(true);
		setError(null);
		try {
			const c = (await postRagaComment(slug, body)) as RagaComment;
			setComments((prev) => [c, ...prev]);
			setNewBody("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to post");
		} finally {
			setPosting(false);
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="font-heading text-lg font-semibold">Comments</h3>
			{isSignedIn && (
				<div className="space-y-2">
					<textarea
						className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						rows={3}
						placeholder="Add a comment..."
						value={newBody}
						onChange={(e) => setNewBody(e.target.value)}
						disabled={posting}
					/>
					<Button
						size="sm"
						onClick={handlePost}
						disabled={posting || !newBody.trim()}
					>
						{posting ? "Posting…" : "Post"}
					</Button>
					{error && (
						<p className="text-destructive text-sm">{error}</p>
					)}
				</div>
			)}
			<ul className="space-y-3">
				{comments.length === 0 ? (
					<li className="text-muted-foreground text-sm">
						No comments yet.
					</li>
				) : (
					comments.map((c) => (
						<li
							key={c.id}
							className="rounded-lg border bg-card p-3 text-card-foreground"
						>
							<p className="text-muted-foreground text-xs">
								{c.username} ·{" "}
								{new Date(c.createdAt).toLocaleDateString()}
							</p>
							<p className="mt-1 text-sm">{c.body}</p>
						</li>
					))
				)}
			</ul>
		</div>
	);
}

export function ReviewsList({
	slug,
	initialComments,
}: ReviewsListProps) {
	const authAvailable = useAuthAvailable();
	if (!authAvailable) {
		return <ReviewsListReadOnly initialComments={initialComments} />;
	}
	return (
		<ReviewsListWithAuth slug={slug} initialComments={initialComments} />
	);
}
