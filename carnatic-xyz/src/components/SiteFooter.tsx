import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="border-t border-border bg-muted/30 mt-auto">
			<div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
				<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
					<Link href="/credits" className="hover:text-foreground underline-offset-4 hover:underline">
						Credits
					</Link>
					<Link href="/contribute" className="hover:text-foreground underline-offset-4 hover:underline">
						Contribute
					</Link>
					<a
						href="https://www.karnatik.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-foreground underline-offset-4 hover:underline"
					>
						karnATik (lyrics &amp; reference)
					</a>
				</div>
				<p className="text-center sm:text-right">
					© {new Date().getFullYear()} carnatic.xyz · Ragas, kritis &amp; the tradition
				</p>
			</div>
		</footer>
	);
}
