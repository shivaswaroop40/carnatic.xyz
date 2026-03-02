import { RagaCard } from "./RagaCard";
import type { RagaListItem } from "@/lib/api/ragas";

interface RagaGridProps {
	ragas: RagaListItem[];
}

export function RagaGrid({ ragas }: RagaGridProps) {
	if (ragas.length === 0) {
		return (
			<p className="text-muted-foreground col-span-full py-12 text-center">
				No ragas match your filters. Try a different search or type.
			</p>
		);
	}
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{ragas.map((raga) => (
				<RagaCard key={raga.id} raga={raga} />
			))}
		</div>
	);
}
