"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AudioDetailPage() {
	const params = useParams();
	const id = typeof params.id === "string" ? params.id : "";
	const [audio, setAudio] = useState<{ title: string; username: string; audioUrl: string } | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		fetch(`/api/audio/${id}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((r: unknown) => setAudio(r as typeof audio))
			.catch(() => setAudio(null))
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return <div className="container mx-auto py-8">Loading…</div>;
	if (!audio) {
		return (
			<div className="container mx-auto py-8">
				<p className="text-destructive">Not found</p>
				<Link href="/community" className="text-primary mt-2 inline-block underline">Back</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl py-8">
			<Link href="/community" className="text-muted-foreground mb-4 inline-block text-sm underline">← Community</Link>
			<h1 className="text-2xl font-bold">{audio.title}</h1>
			<p className="text-muted-foreground mt-1">{audio.username}</p>
			{audio.audioUrl && (
				<audio className="mt-4 w-full" controls src={audio.audioUrl}>
					Your browser does not support audio.
				</audio>
			)}
		</div>
	);
}
