# Composition data (JSON)

The seed **always** includes 100+ compositions from a built-in list. When `compositions.json` exists, it is **merged**: entries with the same `slug` override the built-in (so you can add full lyrics, notation, meaning, rendition links), and entries with new slugs are added.

Each entry can include:

- **title**, **slug**, **composerSlug**, **ragaSlug**, **tala**, **type**, **language** (required)
- **lyricsOriginal**, **lyricsTransliterated**, **lyricsTranslated** (lyrics in original script, transliteration, translation)
- **meaning** – prose meaning/commentary
- **notation** – sargam or notation text
- **renditionUrls** – array of `{ "url": "https://...", "label": "Optional label" }` (e.g. YouTube links)
- **difficulty** – e.g. "beginner", "intermediate", "advanced"

To have **full lyrics, notation, and meaning** on the site, add or complete these fields in `compositions.json` for the composition (use the same `slug` as the built-in to override). The generator merges this file into the 100+ built-in list.

After editing, run:

```bash
node scripts/generate-seed.mjs
npx wrangler d1 execute carnatic-music-db --local --file=scripts/seed-generated.sql
```

Ensure **composerSlug** and **ragaSlug** match existing composers and ragas in the seed (see `scripts/generate-seed.mjs`).
