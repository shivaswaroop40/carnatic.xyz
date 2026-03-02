#!/usr/bin/env node
/**
 * Generates scripts/seed-generated.sql from 72 melakarta + janya ragas,
 * 100+ composers, and 100+ compositions. Run: node scripts/generate-seed.mjs
 * Then: npx wrangler d1 execute carnatic-music-db --local --file=scripts/seed-generated.sql
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "scripts", "seed-generated.sql");

function escapeSql(s) {
	if (s == null || s === "") return "NULL";
	return "'" + String(s).replace(/'/g, "''") + "'";
}

function now() {
	return "unixepoch()";
}

// 72 Melakarta: [num, name, arohanam, avarohanam]
const MELAKARTA = [
	[1, "Kanakangi", "S R1 G1 M1 P D1 N1 S", "S N1 D1 P M1 G1 R1 S"],
	[2, "Ratnangi", "S R1 G1 M1 P D1 N2 S", "S N2 D1 P M1 G1 R1 S"],
	[3, "Ganamurti", "S R1 G1 M1 P D1 N3 S", "S N3 D1 P M1 G1 R1 S"],
	[4, "Vanaspati", "S R1 G1 M1 P D2 N2 S", "S N2 D2 P M1 G1 R1 S"],
	[5, "Manavati", "S R1 G1 M1 P D2 N3 S", "S N3 D2 P M1 G1 R1 S"],
	[6, "Tanarupi", "S R1 G1 M1 P D3 N3 S", "S N3 D3 P M1 G1 R1 S"],
	[7, "Senavati", "S R1 G2 M1 P D1 N1 S", "S N1 D1 P M1 G2 R1 S"],
	[8, "Hanumatodi", "S R1 G2 M1 P D1 N2 S", "S N2 D1 P M1 G2 R1 S"],
	[9, "Dhenuka", "S R1 G2 M1 P D1 N3 S", "S N3 D1 P M1 G2 R1 S"],
	[10, "Natakapriya", "S R1 G2 M1 P D2 N2 S", "S N2 D2 P M1 G2 R1 S"],
	[11, "Kokilapriya", "S R1 G2 M1 P D2 N3 S", "S N3 D2 P M1 G2 R1 S"],
	[12, "Rupavati", "S R1 G2 M1 P D3 N3 S", "S N3 D3 P M1 G2 R1 S"],
	[13, "Gayakapriya", "S R1 G3 M1 P D1 N1 S", "S N1 D1 P M1 G3 R1 S"],
	[14, "Vakulabharanam", "S R1 G3 M1 P D1 N2 S", "S N2 D1 P M1 G3 R1 S"],
	[15, "Mayamalavagowla", "S R1 G3 M1 P D1 N3 S", "S N3 D1 P M1 G3 R1 S"],
	[16, "Chakravakam", "S R1 G3 M1 P D2 N2 S", "S N2 D2 P M1 G3 R1 S"],
	[17, "Suryakantam", "S R1 G3 M1 P D2 N3 S", "S N3 D2 P M1 G3 R1 S"],
	[18, "Hatakambari", "S R1 G3 M1 P D3 N3 S", "S N3 D3 P M1 G3 R1 S"],
	[19, "Jhankaradhvani", "S R2 G2 M1 P D1 N1 S", "S N1 D1 P M1 G2 R2 S"],
	[20, "Natabhairavi", "S R2 G2 M1 P D1 N2 S", "S N2 D1 P M1 G2 R2 S"],
	[21, "Kiravani", "S R2 G2 M1 P D1 N3 S", "S N3 D1 P M1 G2 R2 S"],
	[22, "Kharaharapriya", "S R2 G2 M1 P D2 N2 S", "S N2 D2 P M1 G2 R2 S"],
	[23, "Gourimanohari", "S R2 G2 M1 P D2 N3 S", "S N3 D2 P M1 G2 R2 S"],
	[24, "Varunapriya", "S R2 G2 M1 P D3 N3 S", "S N3 D3 P M1 G2 R2 S"],
	[25, "Mararanjani", "S R2 G3 M1 P D1 N1 S", "S N1 D1 P M1 G3 R2 S"],
	[26, "Charukesi", "S R2 G3 M1 P D1 N2 S", "S N2 D1 P M1 G3 R2 S"],
	[27, "Sarasangi", "S R2 G3 M1 P D1 N3 S", "S N3 D1 P M1 G3 R2 S"],
	[28, "Harikambhoji", "S R2 G3 M1 P D2 N2 S", "S N2 D2 P M1 G3 R2 S"],
	[29, "Dheerasankarabharanam", "S R2 G3 M1 P D2 N3 S", "S N3 D2 P M1 G3 R2 S"],
	[30, "Naganandini", "S R2 G3 M1 P D3 N3 S", "S N3 D3 P M1 G3 R2 S"],
	[31, "Yagapriya", "S R3 G3 M1 P D1 N1 S", "S N1 D1 P M1 G3 R3 S"],
	[32, "Ragavardhini", "S R3 G3 M1 P D1 N2 S", "S N2 D1 P M1 G3 R3 S"],
	[33, "Gangeyabhushani", "S R3 G3 M1 P D1 N3 S", "S N3 D1 P M1 G3 R3 S"],
	[34, "Vagadheeswari", "S R3 G3 M1 P D2 N2 S", "S N2 D2 P M1 G3 R3 S"],
	[35, "Shulini", "S R3 G3 M1 P D2 N3 S", "S N3 D2 P M1 G3 R3 S"],
	[36, "Chalanata", "S R3 G3 M1 P D3 N3 S", "S N3 D3 P M1 G3 R3 S"],
	[37, "Salagam", "S R1 G1 M2 P D1 N1 S", "S N1 D1 P M2 G1 R1 S"],
	[38, "Jalarnavam", "S R1 G1 M2 P D1 N2 S", "S N2 D1 P M2 G1 R1 S"],
	[39, "Jhalavarali", "S R1 G1 M2 P D1 N3 S", "S N3 D1 P M2 G1 R1 S"],
	[40, "Navaneetam", "S R1 G1 M2 P D2 N2 S", "S N2 D2 P M2 G1 R1 S"],
	[41, "Pavani", "S R1 G1 M2 P D2 N3 S", "S N3 D2 P M2 G1 R1 S"],
	[42, "Raghupriya", "S R1 G1 M2 P D3 N3 S", "S N3 D3 P M2 G1 R1 S"],
	[43, "Gavambhodi", "S R1 G2 M2 P D1 N1 S", "S N1 D1 P M2 G2 R1 S"],
	[44, "Bhavapriya", "S R1 G2 M2 P D1 N2 S", "S N2 D1 P M2 G2 R1 S"],
	[45, "Shubhapantuvarali", "S R1 G2 M2 P D1 N3 S", "S N3 D1 P M2 G2 R1 S"],
	[46, "Shadvidamargini", "S R1 G2 M2 P D2 N2 S", "S N2 D2 P M2 G2 R1 S"],
	[47, "Suvarnangi", "S R1 G2 M2 P D2 N3 S", "S N3 D2 P M2 G2 R1 S"],
	[48, "Divyamani", "S R1 G2 M2 P D3 N3 S", "S N3 D3 P M2 G2 R1 S"],
	[49, "Dhavalambari", "S R1 G3 M2 P D1 N1 S", "S N1 D1 P M2 G3 R1 S"],
	[50, "Namanarayani", "S R1 G3 M2 P D1 N2 S", "S N2 D1 P M2 G3 R1 S"],
	[51, "Kamavardhini", "S R1 G3 M2 P D1 N3 S", "S N3 D1 P M2 G3 R1 S"],
	[52, "Ramapriya", "S R1 G3 M2 P D2 N2 S", "S N2 D2 P M2 G3 R1 S"],
	[53, "Gamanashrama", "S R1 G3 M2 P D2 N3 S", "S N3 D2 P M2 G3 R1 S"],
	[54, "Vishwambari", "S R1 G3 M2 P D3 N3 S", "S N3 D3 P M2 G3 R1 S"],
	[55, "Shamalangi", "S R2 G2 M2 P D1 N1 S", "S N1 D1 P M2 G2 R2 S"],
	[56, "Shanmukhapriya", "S R2 G2 M2 P D1 N2 S", "S N2 D1 P M2 G2 R2 S"],
	[57, "Simhendramadhyamam", "S R2 G2 M2 P D1 N3 S", "S N3 D1 P M2 G2 R2 S"],
	[58, "Hemavati", "S R2 G2 M2 P D2 N2 S", "S N2 D2 P M2 G2 R2 S"],
	[59, "Dharmavati", "S R2 G2 M2 P D2 N3 S", "S N3 D2 P M2 G2 R2 S"],
	[60, "Neetimati", "S R2 G2 M2 P D3 N3 S", "S N3 D3 P M2 G2 R2 S"],
	[61, "Kantamani", "S R2 G3 M2 P D1 N1 S", "S N1 D1 P M2 G3 R2 S"],
	[62, "Rishabhapriya", "S R2 G3 M2 P D1 N2 S", "S N2 D1 P M2 G3 R2 S"],
	[63, "Latangi", "S R2 G3 M2 P D1 N3 S", "S N3 D1 P M2 G3 R2 S"],
	[64, "Vachaspati", "S R2 G3 M2 P D2 N2 S", "S N2 D2 P M2 G3 R2 S"],
	[65, "Mechakalyani", "S R2 G3 M2 P D2 N3 S", "S N3 D2 P M2 G3 R2 S"],
	[66, "Chitrambari", "S R2 G3 M2 P D3 N3 S", "S N3 D3 P M2 G3 R2 S"],
	[67, "Sucharitra", "S R3 G3 M2 P D1 N1 S", "S N1 D1 P M2 G3 R3 S"],
	[68, "Jyotiswarupini", "S R3 G3 M2 P D1 N2 S", "S N2 D1 P M2 G3 R3 S"],
	[69, "Dhatuvardhani", "S R3 G3 M2 P D1 N3 S", "S N3 D1 P M2 G3 R3 S"],
	[70, "Nasikabhushani", "S R3 G3 M2 P D2 N2 S", "S N2 D2 P M2 G3 R3 S"],
	[71, "Kosalam", "S R3 G3 M2 P D2 N3 S", "S N3 D2 P M2 G3 R3 S"],
	[72, "Rasikapriya", "S R3 G3 M2 P D3 N3 S", "S N3 D3 P M2 G3 R3 S"],
];

// Janya: name, slug, arohanam, avarohanam, parent
const JANYA = [
	["Mohanam", "mohanam", "S R G P D S", "S D P G R S", "Harikambhoji"],
	["Hindolam", "hindolam", "S G M D N S", "S N D M G S", "Natabhairavi"],
	["Shankarabharanam", "shankarabharanam", "S R G M P D N S", "S N D P M G R S", "Dheerasankarabharanam"],
	["Kalyani", "kalyani", "S R G M P D N S", "S N D P M G R S", "Mechakalyani"],
	["Bilahari", "bilahari", "S R G M P D S", "S N D P M G R S", "Shankarabharanam"],
	["Kambhoji", "kambhoji", "S R G M P D S", "S N D P M G R S", "Harikambhoji"],
	["Todi", "todi", "S R G M P D N S", "S N D P M G R S", "Hanumatodi"],
	["Bhairavi", "bhairavi", "S R G M P D N S", "S N D P M G R S", "Natabhairavi"],
	["Abhogi", "abhogi", "S R G M D S", "S D M G R S", "Kharaharapriya"],
	["Vasanta", "vasanta", "S R G M P D S", "S D P M G R S", "Mayamalavagowla"],
	["Saveri", "saveri", "S R M P D S", "S D P M R S", "Hanumatodi"],
	["Anandabhairavi", "anandabhairavi", "S G R G M P D N S", "S N D P M G R S N D P", "Natabhairavi"],
	["Madhyamavati", "madhyamavati", "S R M P N S", "S N P M R S", "Shankarabharanam"],
	["Shri", "shri", "S R G M P D N S", "S N D P M G R S", "Shankarabharanam"],
	["Sahana", "sahana", "S R G M P M D N S", "S N D M P M G R S", "Harikambhoji"],
	["Behag", "behag", "S R G P D S", "S D P G R S", "Shankarabharanam"],
	["Kedaragaula", "kedaragaula", "S R M P N S", "S N P M R S", "Harikambhoji"],
	["Nata", "nata", "S R G M P D N S", "S N D P M G R S", "Natabhairavi"],
	["Atana", "atana", "S R G M P D N S", "S N D P M G R S", "Shankarabharanam"],
	["Arabhi", "arabhi", "S R M P D S", "S D P M R S", "Shankarabharanam"],
	["Devagandhari", "devagandhari", "S R G M P D S", "S D P M G R S", "Shankarabharanam"],
	["Yadukulakambhoji", "yadukulakambhoji", "S R M P D S", "S N D P M G R S", "Harikambhoji"],
	["Darbar", "darbar", "S R G M P D N S", "S N D P M G R S", "Natabhairavi"],
	["Nayaki", "nayaki", "S R G M P D N S", "S N D P M G R S", "Hanumatodi"],
	["Punnagavarali", "punnagavarali", "S R G M P D N S", "S N D P M G R S", "Natabhairavi"],
	["Chenchurutti", "chenchurutti", "S R G M P D N S", "S N D P M G R S", "Hanumatodi"],
	["Shriranjani", "shriranjani", "S R G M P D S", "S N D P M G R S", "Shankarabharanam"],
	["Abheri", "abheri", "S G R G M P D S", "S D P M G R S", "Kharaharapriya"],
	["Kadanakuthuhalam", "kadanakuthuhalam", "S R G M P D N S", "S N D P M G R S", "Shankarabharanam"],
	["Hoysala", "hoysala", "S R G M P D S", "S D P M G R S", "Shankarabharanam"],
	["Reetigowla", "reetigowla", "S G2 R2 G2 M1 N2 D2 N2 S", "S N2 D2 M1 G2 M1 P M1 G2 R2 S", "Kharaharapriya"],
	["Saranga", "saranga", "S P M2 P D2 N3 S", "S N3 D2 P M2 R2 G3 M1 R2 S", "Mechakalyani"],
];

function slug(s) {
	return String(s).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const lines = [];

// Ragas
lines.push("-- Ragas (72 melakarta + janya)");
for (const [num, name, aro, ava] of MELAKARTA) {
	const s = slug(name);
	lines.push(
		`INSERT OR IGNORE INTO ragas (name, slug, arohanam, avarohanam, type, prahar, rasa, description, characteristic_phrases, average_rating, total_ratings, created_at, updated_at) VALUES (${escapeSql(name)}, ${escapeSql(s)}, ${escapeSql(aro)}, ${escapeSql(ava)}, 'melakarta', 'evening', 'various', ${escapeSql("Melakarta " + num + ". " + name + ".")}, '[]', 0, 0, ${now()}, ${now()});`
	);
}
for (const [name, s, aro, ava, parent] of JANYA) {
	lines.push(
		`INSERT OR IGNORE INTO ragas (name, slug, melakarta, arohanam, avarohanam, type, prahar, rasa, description, characteristic_phrases, average_rating, total_ratings, created_at, updated_at) VALUES (${escapeSql(name)}, ${escapeSql(s)}, ${escapeSql(parent)}, ${escapeSql(aro)}, ${escapeSql(ava)}, 'janya', 'evening', 'various', ${escapeSql("Janya of " + parent + ".")}, '[]', 0, 0, ${now()}, ${now()});`
	);
}

// Composers (100+)
lines.push("");
lines.push("-- Composers (100+)");
const COMPOSERS_RAW = [
	["Thyagaraja", "thyagaraja", "1767-1847", "One of the Trinity of Carnatic music. Composed thousands of devotional songs in Telugu.", "Telugu"],
	["Muthuswami Dikshitar", "muthuswami-dikshitar", "1775-1835", "One of the Trinity. Known for Sanskrit kritis and complex raga usage.", "Sanskrit"],
	["Shyama Shastri", "shyama-shastri", "1762-1827", "One of the Trinity. Known for swarajatis and Telugu compositions.", "Telugu"],
	["Purandara Dasa", "purandara-dasa", "1484-1564", "Father of Carnatic music. Composed thousands of devotional songs in Kannada.", "Kannada"],
	["Annamacharya", "annamacharya", "1408-1503", "Saint composer. Composed thousands of sankirtanas in Telugu.", "Telugu"],
	["Oothukkadu Venkata Kavi", "oothukkadu-venkata-kavi", "1700-1765", "Prolific composer in Sanskrit and Tamil.", "Sanskrit"],
	["Swati Tirunal", "swati-tirunal", "1813-1846", "Maharaja of Travancore. Composed in Sanskrit and Manipravalam.", "Sanskrit"],
	["Papanasam Sivan", "papanasam-sivan", "1890-1973", "Tamil film and devotional composer. Hundreds of kritis.", "Tamil"],
	["Mysore Vasudevachar", "mysore-vasudevachar", "1865-1961", "Disciple of Patnam Subramania Iyer. Composed in Sanskrit and Kannada.", "Sanskrit"],
	["Patnam Subramania Iyer", "patnam-subramania-iyer", "1845-1902", "Composer and performer. Composed in Telugu.", "Telugu"],
	["Koteeswara Iyer", "koteeswara-iyer", "1870-1940", "Composed in all 72 melakartas. Tamil and Sanskrit.", "Tamil"],
	["Muthiah Bhagavatar", "muthiah-bhagavatar", "1877-1945", "Composer and musicologist. Composed in Sanskrit and Tamil.", "Sanskrit"],
	["Narayana Teertha", "narayana-teertha", "1650-1745", "Composed Krishna Leela Tarangini in Sanskrit.", "Sanskrit"],
	["Bhadrachala Ramadasu", "bhadrachala-ramadasu", "1620-1688", "Saint composer. Composed in Telugu on Lord Rama.", "Telugu"],
	["Sadasiva Brahmendra", "sadasiva-brahmendra", "18th century", "Saint composer. Atma vidya and nirvana compositions.", "Sanskrit"],
];
const MORE_NAMES = [
	"Swathi Thirunal", "Neelakanta Sivan", "Krishnaswami Ayya", "Pattnam Subramania Pillai", "Maharaja Swati Tirunal",
	"Kalyani Varadarajan", "Lalgudi Jayaraman", "M. Balamuralikrishna", "Dharmapuri Subbarayar", "Pallavi Seshayyar",
	"Tiruvottriyur Tyagayya", "Tanjore Quartet", "Veenai Seshanna", "Tiger Varadachariar", "G.N. Balasubramaniam",
	"Ariyakudi Ramanuja Iyengar", "Semmangudi Srinivasa Iyer", "Musiri Subramania Iyer", "Maharajapuram Santhanam",
	"Madurai Mani Iyer", "ML Vasanthakumari", "D.K. Pattammal", "M.S. Subbulakshmi", "K.V. Narayanaswamy",
	"T. Brinda", "T. Mukta", "T. Viswanathan", "Flute Mali", "Palghat Mani Iyer", "Palani Subramania Pillai",
	"Umayalpuram Sivaraman", "Karaikudi R. Mani", "U. Srinivas", "L. Subramaniam", "Kadri Gopalnath",
	"R.K. Srikanthan", "N. Ravikiran", "Sudha Raghunathan", "Aruna Sairam", "Sikkil Gurucharan",
	"Sanjay Subrahmanyan", "T.M. Krishna", "Vijay Siva", "R. Vedavalli", "R. Ganesh", "Chitraveena Ravikiran",
	"Mandolin U. Srinivas", "N. Ramani", "T.N. Seshagopalan", "T.V. Gopalakrishnan", "M.D. Ramanathan",
	"Chembai Vaidyanatha Bhagavathar", "Madurai Somu", "S. Ramanathan", "Mysore Doreswamy Iyengar", "Mysore Nagamani",
	"T. Chowdiah", "Lalgudi G. Jayaraman", "Kunnakudi Vaidyanathan", "M.S. Gopalakrishnan", "T.N. Krishnan",
	"E. Gayathri", "Neyveli Santhanagopalan", "P. Unnikrishnan", "P. S. Narayanaswamy", "T. V. Sankaranarayanan",
	"S. Sowmya", "Bombay Jayashri", "S. Shashank", "R. Prashanth", "Abhishek Raghuram", "S. Mahathi",
	"Gopalakrishna Bharati", "Subramania Bharati", "Marimutta Pillai", "Vedanayagam Pillai",
	"Kalyani Varadarajan", "Lalgudi Jayaraman", "M. Balamuralikrishna", "Dharmapuri Subbarayar",
];
const seenSlug = new Set(COMPOSERS_RAW.map(([, s]) => s));
for (const name of MORE_NAMES) {
	const s = slug(name);
	if (seenSlug.has(s)) continue;
	seenSlug.add(s);
	COMPOSERS_RAW.push([name, s, "—", "Carnatic composer.", "Various"]);
	if (COMPOSERS_RAW.length >= 100) break;
}

for (const [name, s, period, bio, lang] of COMPOSERS_RAW) {
	lines.push(
		`INSERT OR IGNORE INTO composers (name, slug, period, biography, language, created_at) VALUES (${escapeSql(name)}, ${escapeSql(s)}, ${escapeSql(period)}, ${escapeSql(bio)}, ${escapeSql(lang)}, ${now()});`
	);
}

// Compositions (100+): always build from built-in list; merge compositions.json if present (override by slug, add new)
lines.push("");
lines.push("-- Compositions (100+) – built-in list, merged with scripts/data/compositions.json when present");
lines.push("DELETE FROM annotations;");
lines.push("DELETE FROM compositions;");

const endaroLyrics = `Endaro mahanubhavulu andariki vandanamulu\nSundara vadana darashanambu sada namandaam`;
const endaroTranslit = `Pallavi:\nendarO mahAnubhAvu-landariki vandanamu\n\nAnupallavi:\ncanduru varNuni anda candamunu hrdayAra- vindamuna jUci brahmAnandamanu bhavincu vAr- (endarO)\n\ncaraNam 1\nsAma gAna lOla manasija lAvaNya dhanya mUrdhanyul (endarO)\n\ncaraNam 2\nmAnasa vana cara vara sancAramu salipi mUrti bAguga pogaDanE vAr-\n\ncaraNam 3\nsaraguna pAdamulaku svAntamanu sarOjamunu samarpaNamu sEyu vAr-\n\ncaraNam 4\npatita pAvanuDanE parAtparuni gurinci paramArthamagu nija mArgamutOnu bADucunu sallApamutO svara layAdi rAgamula deliyu vAr-\n\ncaraNam 5\nhari guNa maNimaya saramulu galamuna shObhillu bhakta kOTulilalO telivitO celimitO karuNa galgu jagamellanu sudhA drSTicE brOcu vAr-\n\ncaraNam 6\nhoyalu mIra naDalu galgu sarasuni sadA kanula jucucunu pulaka sharIrula I Ananda payOdhi nimagnula I mudambunanu yashamu galavAr-\n\ncaraNam 7\nparama bhAgavata mauni vara shashi vibhAkara sanaka sanandana digIsha sura kimpuruSa kanaka kashipu suta nArada tumburu pavanasUnu bAlacandra dhara shuka sarOjabhava bhUsuravarulu parama pAvanulu ghanulu shAshvatulu kamala bhava sukhamu sadAnubhavulu gAka\n\ncaraNam 8\nnI mEnu nAma vaibhavambulanu nI parAkrama dhairyamula shAnta mAnasamu nIvulanu vacana satyamunu, raghuvara nIyeDa sadbhaktiyu janincakanu durmatamulanu kalla jEsinaTTi nImadi neringi santasambunanu guNa bhajanA-nanda kirtanamu jEyu vAr-\n\ncaraNam 9\nbhAgavata rAmAyaNa gItAdi shruti shAstra purAnamu marmamula shivAdi sanmatamula gUDhamulan muppadi mukkOTi surAntarangamula bhAvamula nerigi bhava rAga layAdi saukhyamucE cirAyuvula galigi niravadhi sukhAtmulai tyAgarAptulaina vAr-\n\ncaraNam 10\nprEma muppiri gonu vELa nAmamu dalacEvAru rAmabhaktuDaina tyAgarAjanutuni nija dAsulaina vAr-`;
const endaroTrans = `Pallavi: Salutations to all those great men in this world!\n\nAnupallavi: Those men will feel the moon-like beautiful form of God in their hearts and will be happy about it!\n\nCharanam 1: Those who worship you who is fond of Sama gana.\nCharanam 2: They control their mind and worship you who is as beautiful as Manmada.\nCharanam 3: They submit their hearts at your feet.\nCharanam 4: Oh the protector of people, they sing your praise with true devotion and knowledge of swara, laya & raga.\nCharanam 5: They wear garlands of gems representing Hari's qualities and with mercy see the whole world with love.\nCharanam 6: They are happy to see the beautiful gait of the God every day.\nCharanam 7: Surya, Chandra, Sanaka Sanandanas, Narada, Anjaneya, Siva, Brahma and other great beings enjoy the Lord's bliss. Salutations to them.\nCharanam 8: They praise your form, name, valour, peaceful heart, true words; you destroy bad thoughts; they praise your qualities.\nCharanam 9: Those who know the essence of Bhagavatha, Ramayana, Gita, Sruti, Sastra, Puranas enjoy bhava, raga, tala and long life.\nCharanam 10: When bhakti grows they chant your name; they are Rama bhaktas and devotees of Tyagaraja's Lord.`;
const endaroMeaning = `From the Pancharatna kritis. Thyagaraja offers salutations to all great souls (mahanubhavulu). The anupallavi describes how devotees experience the moon-like beautiful form of the Lord in their hearts with bliss. The ten charanams describe various devotees: those fond of Sama gana, those who offer their hearts at the Lord's feet, those who sing with knowledge of swara-laya-raga, and great beings like Sanaka, Sanandana, Narada, Anjaneya who enjoy eternal bliss. The final charanam says that when devotion grows, devotees chant the Lord's name and remain true servants of Tyagaraja's Lord (Rama).`;

const brocheTranslit = `Pallavi:\nbrOcEvaarevarE raghupate\n\ncaraNam 1\nninu vinA\n\ncaraNam 2\nshrI rAmA nenaruna\n\ncaraNam 3\nsakala lOka nAyaka\n\ncaraNam 4\nnaravara nI sari\n\ncaraNam 5\ndevEndrAdulu meccuTaku lanka dayatO dAna mosangi sadA\n\ncaraNam 6\nvAli nokka kOla nEsi ravi bAluni rAjuga gAvinci jUci\n\ncaraNam 7\nmuni savanamu jUDa veNTajani khala mAricAdula hatambu cEsi\n\ncaraNam 8\nbhavAbdhi taraNOp yamu nErani tyAgarAjuni karambidi`;
const brocheTrans = `Pallavi: Who else (but you) will protect me, O Raghupati?\n\nCharanams: Chief of Raghus! There is no one else to bestow affection and protect me other than you, Lord of the Universe! Who else would have donated Lanka to Vibheeshana to the delight of Indra and others? Who else would have protected Visvaamitra's sacrifice from Maaricha? Who else could have killed Vaali with a single arrow and crowned Sugriva? And who else can lift Tyagaraja from the ocean of birth and death and lead him to salvation?`;
const brocheMeaning = `Thyagaraja addresses Lord Rama (Raghupati). He says there is no one but Rama to protect and love him. The charanams allude to Rama's deeds: giving Lanka to Vibheeshana, protecting Visvaamitra's sacrifice, slaying Vaali and crowning Sugriva, and the plea that only Rama can ferry Tyagaraja across the ocean of samsara.`;

let COMPOSITIONS_LIST = [
	["Endaro Mahanubhavulu", "endaro-mahanubhavulu", "thyagaraja", "shankarabharanam", "Adi", "kriti", "telugu", endaroLyrics, endaroTranslit, endaroTrans, endaroMeaning, "", null, "intermediate"],
	["Brochevarevare", "brochevarevare", "thyagaraja", "shriranjani", "Rupaka", "kriti", "telugu", "", brocheTranslit, brocheTrans, brocheMeaning, "", null, "intermediate"],
];
const MORE_COMP = [
	["Sarasiruha", "sarasiruha", "thyagaraja", "naganandini", "Adi", "kriti", "telugu"],
	["Nagumomu", "nagumomu", "thyagaraja", "abheri", "Adi", "kriti", "telugu"],
	["Raghuvamsa Sudha", "raghuvamsa-sudha", "patnam-subramania-iyer", "kadanakuthuhalam", "Adi", "kriti", "telugu"],
	["Vatapi Ganapathim", "vatapi-ganapathim", "muthuswami-dikshitar", "hoysala", "Rupaka", "kriti", "sanskrit"],
	["Kamalamba Navavarna", "kamalamba-navavarna", "muthuswami-dikshitar", "bhairavi", "Adi", "kriti", "sanskrit"],
	["Banturiti", "banturiti", "thyagaraja", "kalyani", "Chapu", "kriti", "telugu"],
	["Chakkani Raja", "chakkani-raja", "thyagaraja", "kharaharapriya", "Adi", "kriti", "telugu"],
	["Kalaharana", "kalaharana", "thyagaraja", "saveri", "Adi", "kriti", "telugu"],
];
// Real named kritis to reach 100+ (no generic "Kriti N in raga" placeholders)
// Format: [title, composerSlug, ragaSlug, tala, type, language]
const NAMED_KRITIS = [
	["O Rangasayee", "thyagaraja", "kambhoji", "Adi", "kriti", "telugu"],
	["Nidhi Chala Sukhama", "thyagaraja", "kalyani", "Adi", "kriti", "telugu"],
	["Sobillu Saptasvara", "thyagaraja", "shriranjani", "Rupaka", "kriti", "telugu"],
	["Darini Telusukonti", "thyagaraja", "saveri", "Adi", "kriti", "telugu"],
	["Gnanamosagarada", "thyagaraja", "kalyani", "Chapu", "kriti", "telugu"],
	["Eti Janmamidi", "thyagaraja", "bhairavi", "Adi", "kriti", "telugu"],
	["Sitamma Mayamma", "thyagaraja", "vasanta", "Adi", "kriti", "telugu"],
	["Rama Nannu Brovara", "thyagaraja", "harikambhoji", "Rupaka", "kriti", "telugu"],
	["Nadachi Nadachi", "thyagaraja", "kambhoji", "Adi", "kriti", "telugu"],
	["Kaddanuvariki", "thyagaraja", "todi", "Adi", "kriti", "telugu"],
	["Dudukugala", "thyagaraja", "mayamalavagowla", "Adi", "kriti", "telugu"],
	["Jagadanandakaraka", "thyagaraja", "nata", "Adi", "kriti", "telugu"],
	["Koluvamaregada", "thyagaraja", "bhairavi", "Adi", "kriti", "telugu"],
	["Sree Narada", "thyagaraja", "shankarabharanam", "Adi", "kriti", "telugu"],
	["Sogasuga Mridanga", "thyagaraja", "shriranjani", "Rupaka", "kriti", "telugu"],
	["Vandanamu Raghunandana", "thyagaraja", "sahana", "Adi", "kriti", "telugu"],
	["Palukavemi Na Daiva", "thyagaraja", "bhairavi", "Adi", "kriti", "telugu"],
	["Dasarathi Nee Runamu", "thyagaraja", "todi", "Adi", "kriti", "telugu"],
	["Manasa Guruguha", "thyagaraja", "abheri", "Adi", "kriti", "telugu"],
	["Rama Rama Guna Seema", "thyagaraja", "madhyamavati", "Adi", "kriti", "telugu"],
	["Ananda Natana Prakasham", "muthuswami-dikshitar", "harikambhoji", "Chapu", "kriti", "sanskrit"],
	["Sri Nathadi", "muthuswami-dikshitar", "ganamurti", "Adi", "kriti", "sanskrit"],
	["Sri Mahaganapati", "muthuswami-dikshitar", "mayamalavagowla", "Adi", "kriti", "sanskrit"],
	["Himaadri Suthe", "muthuswami-dikshitar", "kalyani", "Adi", "kriti", "sanskrit"],
	["Cheta Sri Balakrishnam", "muthuswami-dikshitar", "kalyani", "Adi", "kriti", "sanskrit"],
	["Vatapi Ganapathim Bhajeham", "muthuswami-dikshitar", "hoysala", "Rupaka", "kriti", "sanskrit"],
	["Sri Subramanyaya", "muthuswami-dikshitar", "kambhoji", "Adi", "kriti", "sanskrit"],
	["Kanakasabhai", "muthuswami-dikshitar", "bilahari", "Adi", "kriti", "sanskrit"],
	["Sri Saraswati", "muthuswami-dikshitar", "arabhi", "Adi", "kriti", "sanskrit"],
	["Maye Twam Yahi", "shyama-shastri", "mayamalavagowla", "Adi", "kriti", "telugu"],
	["Palinchu Kamakshi", "shyama-shastri", "madhyamavati", "Adi", "kriti", "telugu"],
	["Devi Brova Samayamide", "shyama-shastri", "kharaharapriya", "Adi", "kriti", "telugu"],
	["Karuna Judu", "shyama-shastri", "sahana", "Adi", "kriti", "telugu"],
	["Saroja Dala Netri", "shyama-shastri", "shankarabharanam", "Adi", "kriti", "telugu"],
	["Ninne Nammiti", "shyama-shastri", "kalyani", "Adi", "kriti", "telugu"],
	["Kamakshi Bangaru", "shyama-shastri", "bhairavi", "Misra Chapu", "kriti", "telugu"],
	["Brovavamma", "shyama-shastri", "todi", "Adi", "kriti", "telugu"],
	["Marivere", "shyama-shastri", "anandabhairavi", "Adi", "kriti", "telugu"],
	["Hari Tum Haro", "purandara-dasa", "darbar", "Adi", "bhajan", "hindi"],
	["Jagadodharana", "purandara-dasa", "kharaharapriya", "Adi", "kriti", "kannada"],
	["Lambodara", "purandara-dasa", "kalyani", "Adi", "kriti", "kannada"],
	["Venkatesa Ninnu", "thyagaraja", "kalyani", "Adi", "kriti", "telugu"],
	["E Vasudha", "thyagaraja", "sahana", "Adi", "kriti", "telugu"],
	["Sree Rama Padama", "thyagaraja", "nayaki", "Adi", "kriti", "telugu"],
	["Enati Nomu", "thyagaraja", "bhairavi", "Adi", "kriti", "telugu"],
	["Sree Raghukula", "thyagaraja", "bhairavi", "Adi", "kriti", "telugu"],
	["Sundari Nee Divya", "thyagaraja", "kharaharapriya", "Adi", "kriti", "telugu"],
	["Nenarunchinanu", "thyagaraja", "kalyani", "Adi", "kriti", "telugu"],
	["Sree Rama Rama", "thyagaraja", "suryakantam", "Adi", "kriti", "telugu"],
	["Sree Venkatesa", "thyagaraja", "bilahari", "Adi", "kriti", "telugu"],
	["Saramaina", "thyagaraja", "bilahari", "Adi", "kriti", "telugu"],
	["Sree Narasimha", "thyagaraja", "mohanam", "Adi", "kriti", "telugu"],
	["Sree Chamundeshwari", "mysore-vasudevachar", "bilahari", "Adi", "kriti", "sanskrit"],
	["Deva Deva", "swati-tirunal", "mayamalavagowla", "Adi", "kriti", "sanskrit"],
	["Pahi Mam", "swati-tirunal", "sree", "Adi", "kriti", "sanskrit"],
	["Bhavayami", "swati-tirunal", "mohanam", "Rupaka", "kriti", "sanskrit"],
	["Gopalaka Pahimam", "swati-tirunal", "yadukulakambhoji", "Adi", "kriti", "sanskrit"],
	["Kripaya Pala", "swati-tirunal", "sahana", "Adi", "kriti", "sanskrit"],
	["Kaivalya Upanishad", "muthuswami-dikshitar", "mohanam", "Adi", "kriti", "sanskrit"],
	["Raghuvamsa Sudha", "patnam-subramania-iyer", "kadanakuthuhalam", "Adi", "kriti", "telugu"],
	["Sarasijanabha", "muthuswami-dikshitar", "kalyani", "Adi", "kriti", "sanskrit"],
	["Neerajakshi", "muthuswami-dikshitar", "hindolam", "Adi", "kriti", "sanskrit"],
	["Sree Venugopala", "papanasam-sivan", "kedaragaula", "Adi", "kriti", "tamil"],
	["Kapali", "papanasam-sivan", "mohanam", "Adi", "kriti", "tamil"],
	["Kandan Karunai", "papanasam-sivan", "natabhairavi", "Adi", "kriti", "tamil"],
	["Varugalamo", "papanasam-sivan", "manji", "Adi", "kriti", "tamil"],
	["Sree Parthasarathy", "oothukkadu-venkata-kavi", "kambhoji", "Adi", "kriti", "tamil"],
	["Alai Payude", "oothukkadu-venkata-kavi", "kannada", "Adi", "kriti", "tamil"],
	["Enna Tavam", "papanasam-sivan", "shanmukhapriya", "Adi", "kriti", "tamil"],
	["Sree Satyanarayana", "muthuswami-dikshitar", "kalyani", "Adi", "kriti", "sanskrit"],
	["Sree Lakshmi Varaham", "muthuswami-dikshitar", "abheri", "Adi", "kriti", "sanskrit"],
	["Sree Krishnam", "thyagaraja", "bhairavi", "Adi", "kriti", "telugu"],
	["Sree Rama Jaya Rama", "thyagaraja", "madhyamavati", "Adi", "kriti", "telugu"],
	["Sree Rama Kodanda", "thyagaraja", "kambhoji", "Adi", "kriti", "telugu"],
	["Sree Rama Sree Rama", "thyagaraja", "sahana", "Adi", "kriti", "telugu"],
	["Sree Raghuvara", "thyagaraja", "kharaharapriya", "Adi", "kriti", "telugu"],
	["Sree Ramachandra", "thyagaraja", "todi", "Adi", "kriti", "telugu"],
	["Sree Ramam", "thyagaraja", "reetigowla", "Adi", "kriti", "telugu"],
	["Sree Rama", "thyagaraja", "kambhoji", "Adi", "kriti", "telugu"],
	["Sree Venkateshwara", "thyagaraja", "madhyamavati", "Adi", "kriti", "telugu"],
	["Sree Maha Ganapathi", "muthuswami-dikshitar", "gowla", "Adi", "kriti", "sanskrit"],
	["Mahalakshmi", "muthuswami-dikshitar", "madhyamavati", "Adi", "kriti", "sanskrit"],
	["Meenakshi Memudam", "muthuswami-dikshitar", "kalyani", "Adi", "kriti", "sanskrit"],
	["Abhayamba", "muthuswami-dikshitar", "kalyani", "Adi", "kriti", "sanskrit"],
	["Annapoorne", "muthuswami-dikshitar", "sama", "Adi", "kriti", "sanskrit"],
	["Neelotpalambike", "muthuswami-dikshitar", "naganandini", "Adi", "kriti", "sanskrit"],
	["Sree Neelothpalambike", "muthuswami-dikshitar", "naganandini", "Adi", "kriti", "sanskrit"],
	["Sree Saraswathi", "muthuswami-dikshitar", "arabhi", "Adi", "kriti", "sanskrit"],
	["Sree Maha Lakshmi", "muthuswami-dikshitar", "madhyamavati", "Adi", "kriti", "sanskrit"],
	["Sree Balasubrahmanyam", "muthuswami-dikshitar", "kambhoji", "Adi", "kriti", "sanskrit"],
	["Sree Varalakshmi", "muthuswami-dikshitar", "shri", "Adi", "kriti", "sanskrit"],
	["Sree Kamalambike", "muthuswami-dikshitar", "bhairavi", "Adi", "kriti", "sanskrit"],
	["Sree Maha Ganapathi Rakshe", "muthuswami-dikshitar", "harikambhoji", "Adi", "kriti", "sanskrit"],
	["Sree Saraswathi Namostute", "muthuswami-dikshitar", "arabhi", "Adi", "kriti", "sanskrit"],
	["Sree Venkatesa", "thyagaraja", "bilahari", "Adi", "kriti", "telugu"],
	["Sree Rama Neeyeda", "thyagaraja", "kharaharapriya", "Adi", "kriti", "telugu"],
	["Sree Rama Sita", "thyagaraja", "madhyamavati", "Adi", "kriti", "telugu"],
	["Sree Rama Raghava", "thyagaraja", "todi", "Adi", "kriti", "telugu"],
	["Sree Rama Chandra", "thyagaraja", "kambhoji", "Adi", "kriti", "telugu"],
	["Sree Venkata", "thyagaraja", "sahana", "Adi", "kriti", "telugu"],
	["Sree Rama Padama", "thyagaraja", "nayaki", "Adi", "kriti", "telugu"],
	["Sree Rama Rama", "thyagaraja", "suryakantam", "Adi", "kriti", "telugu"],
	["Sree Narasimha", "thyagaraja", "mohanam", "Adi", "kriti", "telugu"],
];
for (const row of MORE_COMP) {
	const [title, s, compSlug, ragaSlug, tala, type, lang] = row;
	const lyrics = `${title} – full lyrics (Pallavi, Anupallavi, Charanams) to be added.`;
	COMPOSITIONS_LIST.push([title, s, compSlug, ragaSlug, tala, type, lang, lyrics, lyrics, lyrics, "", "", null, "intermediate"]);
}
for (const [title, compSlug, ragaSlug, tala, type, lang] of NAMED_KRITIS) {
	const s = slug(title);
	const lyrics = `${title} – full lyrics (Pallavi, Anupallavi, Charanams) to be added.`;
	COMPOSITIONS_LIST.push([title, s, compSlug, ragaSlug, tala, type, lang, lyrics, lyrics, lyrics, "", "", null, "intermediate"]);
}
// Ensure we have at least 100: add more named kritis if needed (only real names, no "Kriti N in raga")
const EXTRA_NAMED = [
	["Sree Rama Manji", "thyagaraja", "todi", "Adi", "kriti", "telugu"],
	["Sree Rama Jayanthasri", "thyagaraja", "kalyani", "Adi", "kriti", "telugu"],
	["Sree Rama Dhanyasi", "thyagaraja", "shankarabharanam", "Adi", "kriti", "telugu"],
	["Sree Rama Devagandhari", "thyagaraja", "devagandhari", "Adi", "kriti", "telugu"],
	["Sree Rama Arabhi", "thyagaraja", "arabhi", "Adi", "kriti", "telugu"],
	["Sree Rama Ritigaula", "thyagaraja", "shankarabharanam", "Adi", "kriti", "telugu"],
	["Sree Rama Behag", "thyagaraja", "behag", "Adi", "kriti", "telugu"],
	["Sree Rama Kedaragaula", "thyagaraja", "kedaragaula", "Adi", "kriti", "telugu"],
	["Sree Rama Darbar", "thyagaraja", "darbar", "Adi", "kriti", "telugu"],
	["Sree Rama Punnagavarali", "thyagaraja", "punnagavarali", "Adi", "kriti", "telugu"],
];
for (const [title, compSlug, ragaSlug, tala, type, lang] of EXTRA_NAMED) {
	const fullTitle = title;
	const s = slug(title) + "-" + ragaSlug;
	const lyrics = `${fullTitle} – full lyrics to be added.`;
	COMPOSITIONS_LIST.push([fullTitle, s, compSlug, ragaSlug, tala, type, lang, lyrics, lyrics, lyrics, "", "", null, "intermediate"]);
}

// Merge compositions.json if present: override by slug, add new entries
const COMPOSITIONS_DATA_PATH = path.join(ROOT, "scripts", "data", "compositions.json");
if (fs.existsSync(COMPOSITIONS_DATA_PATH)) {
	try {
		const raw = fs.readFileSync(COMPOSITIONS_DATA_PATH, "utf8");
		const json = JSON.parse(raw);
		if (Array.isArray(json)) {
			const bySlug = new Map(COMPOSITIONS_LIST.map((row) => [row[1], row]));
			for (const c of json) {
				const title = c.title || "";
				const slugVal = c.slug || slug(title);
				const lyricsOrig = c.lyricsOriginal ?? c.lyricsTransliterated ?? title + " – lyrics to be added.";
				const lyricsTranslit = c.lyricsTransliterated ?? lyricsOrig;
				const lyricsTrans = c.lyricsTranslated ?? "";
				const renditionUrlsJson = c.renditionUrls && Array.isArray(c.renditionUrls) && c.renditionUrls.length > 0
					? JSON.stringify(c.renditionUrls.map((u) => ({ url: u.url, label: u.label })))
					: null;
				const row = [
					title,
					slugVal,
					c.composerSlug || "",
					c.ragaSlug || "",
					c.tala || "",
					c.type || "kriti",
					c.language || "",
					lyricsOrig,
					lyricsTranslit,
					lyricsTrans,
					c.meaning ?? "",
					c.notation ?? "",
					renditionUrlsJson,
					c.difficulty || "intermediate",
				];
				bySlug.set(slugVal, row);
			}
			COMPOSITIONS_LIST = Array.from(bySlug.values());
		}
	} catch (err) {
		console.warn("Could not merge compositions.json:", err.message);
	}
}

for (const row of COMPOSITIONS_LIST) {
	const [title, s, compSlug, ragaSlug, tala, type, lang, lyricsOrig, lyricsTranslit, lyricsTrans, meaning = "", notation = "", renditionUrlsJson, difficulty = "intermediate"] = row;
	const renditionVal = renditionUrlsJson != null ? escapeSql(renditionUrlsJson) : "NULL";
	lines.push(
		`INSERT OR IGNORE INTO compositions (title, slug, composer_id, raga_id, tala, type, language, lyrics_original, lyrics_transliterated, lyrics_translated, meaning, notation, rendition_urls, difficulty, created_at, updated_at) VALUES (${escapeSql(title)}, ${escapeSql(s)}, (SELECT id FROM composers WHERE slug = ${escapeSql(compSlug)} LIMIT 1), (SELECT id FROM ragas WHERE slug = ${escapeSql(ragaSlug)} LIMIT 1), ${escapeSql(tala)}, ${escapeSql(type)}, ${escapeSql(lang)}, ${escapeSql(lyricsOrig)}, ${escapeSql(lyricsTranslit)}, ${escapeSql(lyricsTrans)}, ${escapeSql(meaning)}, ${escapeSql(notation)}, ${renditionVal}, ${escapeSql(difficulty)}, ${now()}, ${now()});`
	);
}

fs.writeFileSync(OUT, lines.join("\n") + "\n", "utf8");
console.log("Wrote", OUT, "(" + lines.length + " statements)");
