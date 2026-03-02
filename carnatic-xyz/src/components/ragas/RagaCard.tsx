import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RagaListItem } from "@/lib/api/ragas";

interface RagaCardProps {
	raga: RagaListItem;
}

export function RagaCard({ raga }: RagaCardProps) {
	const isMelakarta = raga.type === "melakarta";
	return (
		<Link href={`/ragas/${raga.slug}`}>
			<Card
				className={`cursor-pointer transition-all hover:shadow-lg rounded-xl ${
					isMelakarta
						? "border-primary/30 bg-primary/5 dark:bg-primary/10 hover:border-primary/50"
						: "border-border hover:border-accent"
				}`}
			>
				<CardHeader>
					<div className="flex items-start justify-between gap-2">
						<h3 className="font-heading text-xl font-semibold text-foreground">
							{raga.name}
						</h3>
						<Badge
							variant={isMelakarta ? "default" : "secondary"}
							className={isMelakarta ? "bg-primary text-primary-foreground" : ""}
						>
							{raga.type}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{raga.description && (
						<p className="text-muted-foreground line-clamp-2 text-sm">
							{raga.description}
						</p>
					)}
					<div className="mt-3 flex flex-wrap gap-2">
						{raga.prahar && (
							<Badge variant="outline" className="text-xs">
								{raga.prahar}
							</Badge>
						)}
						{raga.rasa && (
							<Badge variant="outline" className="text-xs">
								{raga.rasa}
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
