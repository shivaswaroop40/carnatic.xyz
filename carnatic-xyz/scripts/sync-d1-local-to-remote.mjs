#!/usr/bin/env node
/**
 * Compare local D1 to remote and replicate local data to remote.
 * 1. Export local DB (data only) to scripts/local-export.sql
 * 2. Strip d1_migrations from export (avoids UNIQUE constraint on remote)
 * 3. Clear remote tables
 * 4. Apply the export to remote
 *
 * Prereqs:
 *   - Local schema: npx wrangler d1 migrations apply carnatic-music-db --local
 *   - Local data: npm run seed  (or apply scripts/seed-generated.sql if you use generate-seed.mjs)
 * Run: npm run db:push   (or node scripts/sync-d1-local-to-remote.mjs)
 */

import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DB_NAME = "carnatic-music-db";
const EXPORT_FILE = path.join(ROOT, "scripts", "local-export.sql");
const CLEAR_FILE = path.join(ROOT, "scripts", "db-clear-remote.sql");

const COUNT_SQL = `SELECT 'ragas' as t, count(*) as n FROM ragas UNION ALL SELECT 'composers', count(*) FROM composers UNION ALL SELECT 'compositions', count(*) FROM compositions`;

function runQuiet(cmd, args) {
	const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf-8" });
	return r.status === 0 ? r.stdout.trim() : null;
}

function getCounts(remote) {
	const flag = remote ? "--remote" : "--local";
	const out = runQuiet("npx", ["wrangler", "d1", "execute", DB_NAME, flag, "--command", COUNT_SQL]);
	if (!out) return null;
	const lines = out.split("\n").filter((l) => l && !l.startsWith("t ") && !l.startsWith("---"));
	return lines.map((l) => l.split("|").map((s) => s.trim()));
}

function run(cmd, args, opts = {}) {
	console.log(`\n$ ${cmd} ${args.join(" ")}`);
	const r = spawnSync(cmd, args, {
		cwd: ROOT,
		stdio: "inherit",
		...opts,
	});
	if (r.status !== 0) {
		process.exit(r.status ?? 1);
	}
	return r;
}

console.log("=== D1 sync: local → remote ===\n");

// 0. Compare: show row counts
console.log("0. Row counts (local vs remote):");
const localCounts = getCounts(false);
const remoteCountsBefore = getCounts(true);
if (localCounts && localCounts.length) {
	console.log("   Local:  " + localCounts.map(([t, n]) => `${t}=${n}`).join(", "));
} else {
	console.log("   Local:  (run migrations + seed first)");
}
if (remoteCountsBefore && remoteCountsBefore.length) {
	console.log("   Remote: " + remoteCountsBefore.map(([t, n]) => `${t}=${n}`).join(", "));
} else {
	console.log("   Remote: (unable to read or empty)");
}

// 1. Export local (data only, no schema)
console.log("1. Exporting local D1 (data only)...");
run("npx", [
	"wrangler", "d1", "export", DB_NAME,
	"--local",
	"--output", EXPORT_FILE,
	"--no-schema",
]);

if (!fs.existsSync(EXPORT_FILE)) {
	console.error("Export file was not created.");
	process.exit(1);
}

// Strip d1_migrations from export so remote doesn't get UNIQUE constraint
let sql = fs.readFileSync(EXPORT_FILE, "utf-8");
sql = sql
	.split("\n")
	.filter((line) => !line.includes("d1_migrations"))
	.join("\n");

// Reorder INSERTs so parents come before children (FK-safe)
const FK_ORDER = [
	"ragas", "composers", "compositions", "resources", "questions",
	"answers", "comments", "votes", "user_audios", "user_progress",
	"raga_ratings", "annotations",
];
const lines = sql.split("\n");
const pragmas = lines.filter((l) => l.startsWith("PRAGMA"));
const byTable = new Map();
for (const line of lines) {
	if (!line.trim()) continue;
	const m = line.match(/INSERT INTO\s+"?(\w+)"?\s/);
	const table = m ? m[1] : "_other";
	if (!byTable.has(table)) byTable.set(table, []);
	byTable.get(table).push(line);
}
const reordered = [
	...pragmas,
	...FK_ORDER.flatMap((t) => byTable.get(t) || []),
	...(byTable.get("_other") || []),
];
fs.writeFileSync(EXPORT_FILE, reordered.join("\n") + "\n", "utf-8");
console.log("   Stripped d1_migrations and reordered for FK safety.");
const size = fs.statSync(EXPORT_FILE).size;
console.log(`   Exported to ${EXPORT_FILE} (${size} bytes).`);

// 2. Clear remote
console.log("\n2. Clearing remote D1 tables...");
run("npx", [
	"wrangler", "d1", "execute", DB_NAME,
	"--remote",
	"--file", CLEAR_FILE,
]);

// 3. Apply export to remote
console.log("\n3. Applying local data to remote...");
run("npx", [
	"wrangler", "d1", "execute", DB_NAME,
	"--remote",
	"--file", EXPORT_FILE,
]);

console.log("\n=== Done. Remote D1 now has the same data as local. ===\n");

// Show remote counts after
const remoteCountsAfter = getCounts(true);
if (remoteCountsAfter && remoteCountsAfter.length) {
	console.log("Remote row counts now: " + remoteCountsAfter.map(([t, n]) => `${t}=${n}`).join(", ") + "\n");
}
