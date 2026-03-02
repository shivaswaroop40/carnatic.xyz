import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { AuthAvailableProvider } from "@/lib/auth-available";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const lora = Lora({
	variable: "--font-heading-serif",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "carnatic.xyz - Ragas, Kritis & the Tradition",
	description:
		"Explore ragas, learn kritis, discover composers, and practice with shruti and tala. A platform for Carnatic music.",
};

function hasValidClerkKey(): boolean {
	const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
	return (
		typeof key === "string" &&
		key.length > 20 &&
		(key.startsWith("pk_test_") || key.startsWith("pk_live_")) &&
		!key.includes("placeholder")
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const clerkAvailable = hasValidClerkKey();
	const content = (
		<AuthAvailableProvider value={clerkAvailable}>
			{children}
		</AuthAvailableProvider>
	);
	const body = (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon-violin.png" type="image/png" />
				<link rel="apple-touch-icon" href="/favicon-violin.png" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} font-sans antialiased`}
			>
				<SiteNav />
				<div className="flex min-h-screen flex-col">
				{clerkAvailable ? (
					<ClerkProvider
						publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
					>
						{content}
					</ClerkProvider>
				) : (
					content
				)}
				<SiteFooter />
				</div>
			</body>
		</html>
	);

	return body;
}
