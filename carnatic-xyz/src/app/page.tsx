import Link from "next/link";

export default function Home() {
	return (
		<div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
			{/* Subtle warm gradient background */}
			<div
				className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--carnatic-100),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.25_0.04_45),transparent_50%)]"
				aria-hidden
			/>
			<main className="flex flex-col gap-14 items-center justify-center p-8 pb-16 sm:p-12 max-w-4xl mx-auto w-full">
				{/* Hero */}
				<section className="flex flex-col gap-6 items-center text-center">
					<h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
						carnatic.xyz
					</h1>
					<p className="font-heading text-xl text-muted-foreground max-w-lg sm:text-2xl">
						Ragas, kritis, and the tradition.
					</p>
					<p className="text-muted-foreground max-w-md text-base">
						Explore melakartas and janyas, learn compositions, and practice with
						shruti and tala.
					</p>
					<div className="flex gap-4 flex-wrap justify-center pt-2">
						<Link
							href="/ragas"
							className="rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium text-sm sm:text-base h-11 sm:h-12 px-5 sm:px-6 inline-flex items-center justify-center shadow-sm"
						>
							Browse Ragas
						</Link>
						<Link
							href="/compositions"
							className="rounded-full border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-medium text-sm sm:text-base h-11 sm:h-12 px-5 sm:px-6 inline-flex items-center justify-center"
						>
							Kritis & Compositions
						</Link>
						<Link
							href="/learn/tools/tanpura"
							className="rounded-full border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-medium text-sm sm:text-base h-11 sm:h-12 px-5 sm:px-6 inline-flex items-center justify-center"
						>
							Tanpura
						</Link>
					</div>
				</section>

				{/* Featured strip: Explore a raga */}
				<section className="w-full rounded-2xl border border-border bg-card/80 p-6 sm:p-8">
					<h2 className="font-heading text-lg font-semibold text-foreground mb-4">
						Explore a raga
					</h2>
					<p className="text-muted-foreground text-sm mb-6">
						Start with a melakarta or a janya — each has its own arohanam and
						avarohanam.
					</p>
					<div className="flex flex-wrap gap-4">
						<Link
							href="/ragas/shankarabharanam"
							className="flex-1 min-w-[200px] rounded-xl border border-border bg-background/50 p-4 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
						>
							<span className="font-heading font-semibold text-foreground group-hover:text-primary block">
								Shankarabharanam
							</span>
							<span className="text-xs text-muted-foreground mt-0.5 block">
								Melakarta · 29th
							</span>
						</Link>
						<Link
							href="/ragas/mohanam"
							className="flex-1 min-w-[200px] rounded-xl border border-border bg-background/50 p-4 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
						>
							<span className="font-heading font-semibold text-foreground group-hover:text-primary block">
								Mohanam
							</span>
							<span className="text-xs text-muted-foreground mt-0.5 block">
								Janya · Pentatonic
							</span>
						</Link>
					</div>
					<div className="mt-4">
						<Link
							href="/ragas"
							className="text-sm font-medium text-primary hover:underline"
						>
							View all ragas →
						</Link>
					</div>
				</section>

				{/* Start with a kriti */}
				<section className="w-full rounded-2xl border border-border bg-card/80 p-6 sm:p-8">
					<h2 className="font-heading text-lg font-semibold text-foreground mb-4">
						Start with a kriti
					</h2>
					<p className="text-muted-foreground text-sm mb-6">
						Learn lyrics, tala, and meaning. Full pallavi, anupallavi, and
						charanaṃs when available.
					</p>
					<Link
						href="/compositions/endaro-mahanubhavulu"
						className="block rounded-xl border border-border bg-background/50 p-4 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
					>
						<span className="font-heading font-semibold text-foreground group-hover:text-primary">
							Endaro Mahanubhavulu
						</span>
						<span className="text-xs text-muted-foreground mt-0.5 block">
							Thyagaraja · Shankarabharanam · Adi tala
						</span>
					</Link>
					<div className="mt-4">
						<Link
							href="/compositions"
							className="text-sm font-medium text-primary hover:underline"
						>
							Browse all compositions →
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}
