import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Contribute - carnatic.xyz",
	description:
		"How to contribute via GitHub: issues, pull requests, and what to work on.",
};

export default function ContributePage() {
	return (
		<div className="container mx-auto max-w-3xl py-10 px-4">
			<Link
				href="/"
				className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm underline"
			>
				← Home
			</Link>
			<h1 className="font-heading text-3xl font-bold text-foreground mb-2">
				Contribute
			</h1>
			<p className="text-muted-foreground mb-10">
				Contributions happen on GitHub. Open issues for bugs and ideas, and
				send pull requests for code and data changes.
			</p>

			<section className="mb-10">
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					GitHub
				</h2>
				<p className="text-muted-foreground mb-4">
					The project is hosted on GitHub. Clone the repo, open issues, and
					submit pull requests (PRs) against the default branch. Ensure that
					<code className="rounded bg-muted px-1.5 py-0.5 text-sm mx-1">npm run lint</code>
					passes and that any new env or deploy steps are documented in the
					README or <code className="rounded bg-muted px-1.5 py-0.5 text-sm">docs/</code>.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					Issues you can open
				</h2>
				<ul className="list-disc list-inside text-muted-foreground space-y-2">
					<li>
						<strong className="text-foreground">Bugs:</strong> Broken links,
						incorrect data (raga scale, composer dates, lyrics), API errors,
						or UI/UX bugs. Include steps to reproduce and environment (e.g.
						localhost vs production).
					</li>
					<li>
						<strong className="text-foreground">Data corrections:</strong> Fix
						compositions, ragas, or composers (typos, missing fields, wrong
						attribution). Prefer a PR that edits <code className="rounded bg-muted px-1 py-0.5 text-sm">scripts/data/compositions.json</code> or
						the seed generator, with a short issue describing the change.
					</li>
					<li>
						<strong className="text-foreground">Feature ideas:</strong> New
						pages, filters, search improvements, 						learn tools (e.g. shruti,
						metronome), or integrations. Describe the use case and optionally
						propose an approach.
					</li>
					<li>
						<strong className="text-foreground">Docs & deploy:</strong> Gaps in
						README, <code className="rounded bg-muted px-1 py-0.5 text-sm">docs/DEPLOYING-CLOUDFLARE.md</code>, or
						comments in config (wrangler, next.config). Clarifications and
						step-by-step fixes are welcome.
					</li>
					<li>
						<strong className="text-foreground">Accessibility & i18n:</strong>
						Improving a11y (labels, focus, contrast) or adding/improving
						translations. Open an issue to discuss scope before large PRs.
					</li>
				</ul>
			</section>

			<section className="mb-10">
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					Pull requests you can send
				</h2>
				<ul className="list-disc list-inside text-muted-foreground space-y-2">
					<li>
						<strong className="text-foreground">Compositions & data:</strong> Add
						or edit entries in <code className="rounded bg-muted px-1 py-0.5 text-sm">scripts/data/compositions.json</code> (and
						optionally <code className="rounded bg-muted px-1 py-0.5 text-sm">karnatik-urls.json</code>). Keep
						attribution (e.g. karnATik, lyric contributors) as on our{" "}
						<Link href="/credits" className="text-primary hover:underline">Credits</Link> page.
					</li>
					<li>
						<strong className="text-foreground">Ragas / composers:</strong> Extend
						<code className="rounded bg-muted px-1.5 py-0.5 text-sm mx-1">scripts/generate-seed.mjs</code> (melakarta,
						janya, or composer list) and regenerate seed. Ensure new slugs are
						used consistently (e.g. in compositions).
					</li>
					<li>
						<strong className="text-foreground">UI components & pages:</strong> New
						or updated components in <code className="rounded bg-muted px-1 py-0.5 text-sm">src/components</code> and
						pages in <code className="rounded bg-muted px-1 py-0.5 text-sm">src/app</code>. Follow existing
						patterns (Tailwind, shadcn-style components) and run <code className="rounded bg-muted px-1 py-0.5 text-sm">npm run lint</code>.
					</li>
					<li>
						<strong className="text-foreground">API routes:</strong> New or
						changed endpoints under <code className="rounded bg-muted px-1 py-0.5 text-sm">src/app/api/</code>.
						Document query params and response shape in code or README if
						non-obvious.
					</li>
					<li>
						<strong className="text-foreground">Tests & CI:</strong> Add or
						adjust tests and GitHub Actions (e.g. <code className="rounded bg-muted px-1 py-0.5 text-sm">.github/workflows/deploy.yml</code>).
						Keep the deploy workflow working with the current Cloudflare setup
						(see <code className="rounded bg-muted px-1 py-0.5 text-sm">docs/DEPLOYING-CLOUDFLARE.md</code>).
					</li>
					<li>
						<strong className="text-foreground">Docs:</strong> README, deployment
						guide, or in-repo comments. Fix typos, add “how to run/debug” steps,
						or clarify env and secrets.
					</li>
				</ul>
			</section>

			<section>
				<h2 className="font-heading text-xl font-semibold text-foreground mb-4">
					Before you submit
				</h2>
				<p className="text-muted-foreground mb-4">
					Run <code className="rounded bg-muted px-1.5 py-0.5 text-sm">npm run lint</code> and fix any
					warnings. For data or lyrics taken from karnATik or others, keep
					attribution in the data and reference our{" "}
					<Link href="/credits" className="text-primary hover:underline">Credits</Link> page.
				</p>
			</section>
		</div>
	);
}
