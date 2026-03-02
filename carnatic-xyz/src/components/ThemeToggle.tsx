"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="size-9"
				aria-label="Toggle theme"
			>
				<span className="size-5" />
			</Button>
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<Button
			variant="ghost"
			size="icon"
			className="text-muted-foreground hover:text-foreground size-9"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? (
				<Sun className="size-5" />
			) : (
				<Moon className="size-5" />
			)}
		</Button>
	);
}
