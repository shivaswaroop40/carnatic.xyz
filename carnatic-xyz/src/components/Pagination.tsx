"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

export interface PaginationProps {
	total: number;
	limit?: number;
	offset: number;
	basePath?: string;
	queryParams?: Record<string, string>;
}

export function paginationPageCount(total: number, limit: number): number {
	return Math.max(1, Math.ceil(total / limit));
}

export function paginationCurrentPage(offset: number, limit: number): number {
	return Math.floor(offset / limit) + 1;
}

export function Pagination({
	total,
	limit = PAGE_SIZE,
	offset,
	basePath = "",
	queryParams = {},
}: PaginationProps) {
	const pageCount = paginationPageCount(total, limit);
	const currentPage = paginationCurrentPage(offset, limit);
	if (pageCount <= 1) return null;

	const prevOffset = Math.max(0, offset - limit);
	const nextOffset = offset + limit;
	const hasPrev = offset > 0;
	const hasNext = offset + limit < total;

	function href(off: number) {
		const u = new URL(basePath || window.location.pathname, "http://localhost");
		u.searchParams.set("offset", String(off));
		u.searchParams.set("limit", String(limit));
		Object.entries(queryParams).forEach(([k, v]) => u.searchParams.set(k, v));
		return `${u.pathname}?${u.searchParams.toString()}`;
	}

	return (
		<nav
			className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 mt-8"
			aria-label="Pagination"
		>
			<p className="text-sm text-muted-foreground">
				Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
			</p>
			<div className="flex items-center gap-2">
				{hasPrev ? (
					<Button variant="outline" size="sm" asChild>
						<Link href={href(prevOffset)}>Previous</Link>
					</Button>
				) : (
					<Button variant="outline" size="sm" disabled>
						Previous
					</Button>
				)}
				<span className="text-sm text-muted-foreground px-2">
					Page {currentPage} of {pageCount}
				</span>
				{hasNext ? (
					<Button variant="outline" size="sm" asChild>
						<Link href={href(nextOffset)}>Next</Link>
					</Button>
				) : (
					<Button variant="outline" size="sm" disabled>
						Next
					</Button>
				)}
			</div>
		</nav>
	);
}

export { PAGE_SIZE as DEFAULT_PAGE_SIZE };
