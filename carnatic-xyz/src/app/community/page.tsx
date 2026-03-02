"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UploadRow {
	id: number;
	title: string;
	username: string;
	audioUrl: string;
	createdAt: string;
}

export default function CommunityPage() {
	const [uploads, setUploads] = useState<UploadRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/audio?limit=20")
			.then((r) => r.json())
			.then((d: unknown) => {
				const data = d as { uploads?: UploadRow[] };
				setUploads(data.uploads ?? []);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-3xl font-bold">Community</h1>
			<p className="text-muted-foreground mb-6">
				Listen to practice recordings from the community.
			</p>
			{loading ? (
				<p className="text-muted-foreground">Loading…</p>
			) : uploads.length === 0 ? (
				<p className="text-muted-foreground">No public uploads yet.</p>
			) : (
				<ul className="grid gap-4 sm:grid-cols-2">
					{uploads.map((u) => (
						<li key={u.id}>
							<Link
								href={`/community/uploads/${u.id}`}
								className="block rounded-lg border p-4 hover:bg-muted/50"
							>
								<h2 className="font-medium">{u.title}</h2>
								<p className="text-muted-foreground text-sm">{u.username}</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
