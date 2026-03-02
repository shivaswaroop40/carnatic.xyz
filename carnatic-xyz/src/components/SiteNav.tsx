"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchPopup } from "@/components/SearchPopup";
import { TanpuraDropdown } from "@/components/TanpuraDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/ragas", label: "Ragas" },
	{ href: "/compositions", label: "Compositions" },
	{ href: "/community", label: "Community" },
	{ href: "/contact", label: "Contact" },
];

export function SiteNav() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);

	return (
		<>
			<SearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} />
			<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto flex h-14 items-center justify-between px-4">
					<Link
						href="/"
						className="font-heading text-lg font-semibold text-foreground"
					>
						carnatic.xyz
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						{NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`text-sm font-medium transition-colors hover:text-foreground ${
									pathname === link.href ||
									(link.href !== "/" && pathname.startsWith(link.href))
										? "text-foreground"
										: "text-muted-foreground"
								}`}
							>
								{link.label}
							</Link>
						))}
						<TanpuraDropdown />
						<ThemeToggle />
						<button
							type="button"
							onClick={() => setSearchOpen(true)}
							className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
							aria-label="Search"
						>
							<Search className="size-5" />
						</button>
					</nav>

					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						aria-label="Open menu"
						onClick={() => setMobileOpen(true)}
					>
						<Menu className="size-5" />
					</Button>
				</div>
			</header>

			{mobileOpen && (
				<div
					className="fixed inset-0 z-50 md:hidden"
					aria-modal
					role="dialog"
				>
					<div
						className="fixed inset-0 bg-black/50"
						onClick={() => setMobileOpen(false)}
					/>
					<div className="fixed inset-y-0 right-0 w-72 max-w-[85vw] border-l border-border bg-background p-6 shadow-xl">
						<div className="flex items-center justify-between mb-6">
							<span className="font-heading text-lg font-semibold">Menu</span>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Close menu"
								onClick={() => setMobileOpen(false)}
							>
								<X className="size-5" />
							</Button>
						</div>
						<nav className="flex flex-col gap-2">
							{NAV_LINKS.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setMobileOpen(false)}
									className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
										pathname === link.href ||
										(link.href !== "/" && pathname.startsWith(link.href))
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
									}`}
								>
									{link.label}
								</Link>
							))}
							<Link
								href="/learn/tools/tanpura"
								onClick={() => setMobileOpen(false)}
								className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
							>
								Tanpura
							</Link>
							<button
								type="button"
								onClick={() => {
									setMobileOpen(false);
									setSearchOpen(true);
								}}
								className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground flex items-center gap-2 w-full text-left"
							>
								<Search className="size-4" /> Search
							</button>
							<div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
								<span>Appearance</span>
								<ThemeToggle />
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
