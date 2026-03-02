import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Credits & Sources - carnatic.xyz",
	description:
		"Attribution and thanks to karnATik, lyric contributors, and reference sources for Carnatic music content.",
};

export default function CreditsPage() {
	return (
		<div className="container mx-auto max-w-3xl py-10 px-4">
			<Link
				href="/"
				className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm underline"
			>
				← Home
			</Link>
			<h1 className="font-heading text-3xl font-bold text-foreground mb-2">
				Credits &amp; Sources
			</h1>
			<p className="text-muted-foreground mb-10">
				carnatic.xyz is inspired by and grateful to the following resources and
				authors. We do not host copies of their full archives; we link and
				attribute so you can explore the originals.
			</p>

			<section className="mb-10">
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					Primary reference: karnATik
				</h2>
				<p className="text-muted-foreground mb-4">
					<a
						href="https://www.karnatik.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline font-medium"
					>
						karnATik – Carnatic music, South Indian classical lyrics
					</a>{" "}
					has been the go-to reference for Carnatic music on the web for decades:
					lyrics (20,000+), ragas, composers, theory, lessons, and notation. The
					site structure and categories (lyrics by composer, by raga, geetams,
					varnams, swarajatis, glossary, melakarta scheme, tala table, etc.)
					inform how we organize ragas, compositions, and learning content here.
				</p>
				<p className="text-muted-foreground mb-4">
					<strong className="text-foreground">Credit:</strong> karnATik is
					maintained by rani (Copyright 1995–2025). We thank rani and all
					contributors for making Carnatic music accessible worldwide. When our
					lyrics, transliterations, or meanings align with karnATik, the
					original credit goes to them and to the lyric contributors they cite
					(e.g. Lakshman Ragde and others).
				</p>
				<p className="text-muted-foreground">
					For the most up-to-date and comprehensive lyrics, notations, and
					translations, please use{" "}
					<a
						href="https://www.karnatik.com/lyrics.shtml"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						karnATik Lyrics
					</a>
					,{" "}
					<a
						href="https://www.karnatik.com/ragas.shtml"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						Ragas
					</a>
					, and{" "}
					<a
						href="https://www.karnatik.com/composers.shtml"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						Composers
					</a>
					.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					Lyrics &amp; notation contributors (via karnATik)
				</h2>
				<p className="text-muted-foreground mb-4">
					Lyrics and meanings on karnATik are contributed by volunteers. We
					acknowledge in particular:
				</p>
				<ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
					<li>
						<strong className="text-foreground">Lakshman Ragde</strong> –
						lyrics contributions (cited on karnATik)
					</li>
					<li>
						<strong className="text-foreground">Shivkumar Kalyanaraman</strong>{" "}
						– Krithi Archive (notation and audio lessons; linked from karnATik)
					</li>
					<li>
						All other lyric and notation contributors credited on karnATik
						pages.
					</li>
				</ul>
				<p className="text-muted-foreground">
					When we use or adapt lyrics/meanings that appear on karnATik, the
					original authorship and contribution remain with those sources.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					Other references
				</h2>
				<ul className="text-muted-foreground space-y-2">
					<li>
						<a
							href="https://www.karnatik.com/glossary.shtml"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							karnATik Glossary
						</a>{" "}
						– terms and symbols
					</li>
					<li>
						<a
							href="https://www.karnatik.com/melas.shtml"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							karnATik Melakartha Scheme
						</a>{" "}
						– 72 melakartas
					</li>
					<li>
						<a
							href="https://www.karnatik.com/taalatable.shtml"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							karnATik Table of Talas
						</a>{" "}
						– tala reference
					</li>
					<li>
						<a
							href="https://www.karnatik.com/beginner.shtml"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							karnATik Beginner Lessons
						</a>{" "}
						– sarali varisai, geetams, practice
					</li>
				</ul>
			</section>

			<section>
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					This site
				</h2>
				<p className="text-muted-foreground">
					carnatic.xyz is an open platform for exploring ragas, compositions,
					composers, and practice tools. Composition data can be extended via{" "}
					<Link href="/compositions" className="text-primary hover:underline">
						scripts/data/compositions.json
					</Link>{" "}
					with proper attribution. We do not copy karnATik&apos;s full database; we
					encourage visitors to use karnATik and other cited sources for the most
					complete lyrics, notations, and theory.
				</p>
			</section>
		</div>
	);
}
