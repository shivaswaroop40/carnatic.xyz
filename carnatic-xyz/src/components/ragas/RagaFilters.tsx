"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export interface RagaFiltersState {
	type: string;
	sort: string;
	q: string;
}

const TYPES = [
	{ value: "", label: "All types" },
	{ value: "melakarta", label: "Melakarta" },
	{ value: "janya", label: "Janya" },
	{ value: "ghana", label: "Ghana" },
];

const SORTS = [
	{ value: "name", label: "Name (A–Z)" },
	{ value: "popular", label: "Popularity" },
];

interface RagaFiltersProps {
	value: RagaFiltersState;
	onChange: (v: RagaFiltersState) => void;
}

export function RagaFilters({ value, onChange }: RagaFiltersProps) {
	const [localQ, setLocalQ] = useState(value.q);

	const handleSearch = useCallback(() => {
		onChange({ ...value, q: localQ.trim() });
	}, [value, localQ, onChange]);

	return (
		<div className="space-y-4">
			<div>
				<Label htmlFor="raga-search">Search</Label>
				<div className="mt-1 flex gap-2">
					<Input
						id="raga-search"
						placeholder="Raga name or description..."
						value={localQ}
						onChange={(e) => setLocalQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
					/>
					<button
						type="button"
						onClick={handleSearch}
						className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 hover:bg-accent"
						aria-label="Search"
					>
						<Search className="size-4" />
					</button>
				</div>
			</div>
			<div>
				<Label>Type</Label>
				<Select
					value={value.type || "all"}
					onValueChange={(v) =>
						onChange({ ...value, type: v === "all" ? "" : v })
					}
				>
					<SelectTrigger className="mt-1">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						{TYPES.map((t) => (
							<SelectItem key={t.value || "all"} value={t.value || "all"}>
								{t.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div>
				<Label>Sort by</Label>
				<Select
					value={value.sort}
					onValueChange={(v) => onChange({ ...value, sort: v })}
				>
					<SelectTrigger className="mt-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{SORTS.map((s) => (
							<SelectItem key={s.value} value={s.value}>
								{s.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
