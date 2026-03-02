interface ScaleDisplayProps {
	arohanam: string;
	avarohanam: string;
}

export function ScaleDisplay({ arohanam, avarohanam }: ScaleDisplayProps) {
	return (
		<div className="space-y-4 rounded-xl border border-border bg-muted/40 dark:bg-muted/20 p-5 font-heading">
			<div>
				<p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
					Arohanam (ascending)
				</p>
				<p className="font-mono text-lg sm:text-xl mt-1 text-foreground">{arohanam}</p>
			</div>
			<div>
				<p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
					Avarohanam (descending)
				</p>
				<p className="font-mono text-lg sm:text-xl mt-1 text-foreground">{avarohanam}</p>
			</div>
		</div>
	);
}
