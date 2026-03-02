#!/usr/bin/env node
/**
 * Cross-reference compositions with karnatik.com and fetch lyrics + meaning.
 * Reads scripts/data/karnatik-urls.json (array of { slug, url }) and
 * scripts/data/compositions.json. For each slug that exists in compositions.json
 * and has a karnatik URL, fetches the page and extracts lyrics + meaning,
 * then updates the composition and writes back. Credits: karnatik.com and
 * lyric contributors (see /credits).
 *
 * Run: node scripts/fetch-karnatik-lyrics.mjs
 * Requires: compositions.json and karnatik-urls.json in scripts/data/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "scripts", "data");
const COMPOSITIONS_PATH = path.join(DATA, "compositions.json");
const MAPPING_PATH = path.join(DATA, "karnatik-urls.json");

const DELAY_MS = 1500;

function delay(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

/**
 * Extract lyrics (transliteration) and meaning from karnatik page HTML text.
 * Strip HTML tags first, then look for pallavi ... lyrics ... Meaning: ... meaning ... Notation/---
 */
function stripHtml(html) {
	return html
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, "\n")
		.replace(/\n+/g, "\n")
		.trim();
}

function parseKarnatikPage(html) {
	const text = stripHtml(html);
	const lyrics = [];
	const meaning = [];
	const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	let state = "before"; // before | lyrics | meaning
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lower = line.toLowerCase();
		if (state === "before" && (lower === "pallavi" || lower.startsWith("pallavi"))) {
			state = "lyrics";
			continue;
		}
		if (state === "lyrics") {
			if (line === "---" || lower.startsWith("meaning:")) {
				state = "meaning";
				if (lower.startsWith("meaning:")) {
					meaning.push(line.replace(/^meaning:\s*/i, "").trim());
				}
				continue;
			}
			if (line) lyrics.push(line);
			continue;
		}
		if (state === "meaning") {
			if (line === "---" || lower.startsWith("notation:") || lower.startsWith("from compositions")) break;
			if (lower.startsWith("other information") || lower.startsWith("lyrics contributed") || lower === "first | previous" || lower.startsWith("contact us")) break;
			if (line) meaning.push(line);
		}
	}
	return {
		lyricsTransliterated: lyrics.join("\n").trim() || null,
		meaning: meaning.join(" ").trim() || null,
	};
}

async function fetchUrl(url) {
	const res = await fetch(url, {
		headers: { "User-Agent": "carnatic-xyz/1.0 (lyrics enrichment; +https://github.com/carnatic-xyz)" },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.text();
}

async function main() {
	if (!fs.existsSync(COMPOSITIONS_PATH)) {
		console.error("Missing compositions.json");
		process.exit(1);
	}
	if (!fs.existsSync(MAPPING_PATH)) {
		console.error("Missing karnatik-urls.json");
		process.exit(1);
	}

	const compositions = JSON.parse(fs.readFileSync(COMPOSITIONS_PATH, "utf8"));
	const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf8"));
	const bySlug = new Map(compositions.map((c) => [c.slug, c]));

	let updated = 0;
	for (const { slug, url } of mapping) {
		const comp = bySlug.get(slug);
		if (!comp) {
			console.warn("Slug not in compositions.json:", slug);
			continue;
		}
		try {
			await delay(DELAY_MS);
			const html = await fetchUrl(url);
			const { lyricsTransliterated, meaning: meaningText } = parseKarnatikPage(html);
			if (lyricsTransliterated) {
				comp.lyricsTransliterated = lyricsTransliterated;
				updated++;
			}
			if (meaningText) {
				comp.meaning = meaningText;
				updated++;
			}
			console.log("OK:", slug);
		} catch (err) {
			console.error("Fail:", slug, err.message);
		}
	}

	fs.writeFileSync(COMPOSITIONS_PATH, JSON.stringify(compositions, null, 2) + "\n", "utf8");
	console.log("Done. Updated", updated, "fields. Wrote", COMPOSITIONS_PATH);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
