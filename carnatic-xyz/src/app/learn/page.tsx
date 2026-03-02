import Link from "next/link";

export default function LearnPage() {
	return (
		<div className="container mx-auto py-12">
			<h1 className="font-heading mb-6 text-3xl font-bold text-foreground">
				Learning Hub
			</h1>
			<p className="text-muted-foreground mb-8 max-w-xl">
				Set shruti and practice. Explore tala tools and community Q&A.
			</p>
			<div className="flex flex-wrap gap-6">
				<Link
					href="/learn/tools/tanpura"
					className="flex-1 min-w-[220px] rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:bg-accent/50 hover:border-primary/30"
				>
					<h2 className="font-heading font-semibold text-foreground">
						Shruti
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Virtual shruti for practice (violin or tambura). Set your tonic and play Pa–Sa–Sa.
					</p>
				</Link>
				<Link
					href="/learn/tools/metronome"
					className="flex-1 min-w-[220px] rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:bg-accent/50 hover:border-primary/30"
				>
					<h2 className="font-heading font-semibold text-foreground">
						Metronome
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Metronome with tala presets for practice.
					</p>
				</Link>
				<Link
					href="/learn/questions"
					className="flex-1 min-w-[220px] rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:bg-accent/50 hover:border-primary/30"
				>
					<h2 className="font-heading font-semibold text-foreground">
						Q&A
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Ask and answer questions from the community.
					</p>
				</Link>
			</div>
			<section className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
				<h2 className="font-heading text-lg font-semibold text-foreground mb-2">
					External resources
				</h2>
				<p className="text-muted-foreground text-sm mb-4">
					For thousands of lyrics, notations, beginner lessons (sarali varisai, geetams, varnams), glossary, and raga/tala reference, we recommend{" "}
					<a
						href="https://www.karnatik.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						karnATik
					</a>
					. We credit karnATik and its contributors in our{" "}
					<Link href="/credits" className="text-primary hover:underline">
						Credits
					</Link>
					.
				</p>
			</section>
		</div>
	);
}
