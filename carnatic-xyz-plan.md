# carnatic.xyz - Complete Implementation Plan
## Carnatic Music Platform - Full-Stack Cloudflare Deployment

**Project Overview:** A comprehensive Carnatic music platform combining Raga Discovery, Lyrics/Notation Library, and Learning Hub with community features.

**Target Domain:** carnatic.xyz (Cloudflare-hosted)

**Estimated Timeline:** 6-8 weeks for MVP

**Monthly Cost:** $1-2 for ~10,000 users

---

## 📚 TABLE OF CONTENTS

1. [Tech Stack](#tech-stack)
2. [Project Initialization](#project-initialization)
3. [Database Schema](#database-schema)
4. [Cloudflare Configuration](#cloudflare-configuration)
5. [API Routes Structure](#api-routes-structure)
6. [Frontend Application Structure](#frontend-application-structure)
7. [Key Features](#key-features)
8. [UI Components](#ui-components)
9. [Authentication](#authentication)
10. [Seed Data](#seed-data)
11. [Styling](#styling)
12. [Deployment](#deployment)
13. [Advanced Features](#advanced-features)
14. [Performance & Security](#performance--security)
15. [Development Roadmap](#development-roadmap)

---

## TECH STACK

### Frontend
- **Next.js 14.2.1** (App Router with Edge Runtime)
- **React 19**
- **TypeScript** (strict mode)
- **TailwindCSS** + **shadcn/ui** components
- **Lucide React** icons

### Backend & Infrastructure
- **Cloudflare Pages** (hosting)
- **Cloudflare Workers** (API routes via Pages Functions)
- **Cloudflare D1** (SQLite database for structured data)
- **Cloudflare R2** (audio file storage)
- **Cloudflare KV** (caching layer)
- **Drizzle ORM** (database ORM with migrations)

### Authentication & Additional Services
- **Clerk** (authentication - free tier supports 10K MAU)
- **OpenAI API** (optional - for AI-powered features like raga identification)

---

## PROJECT INITIALIZATION

### Step 1: Create Next.js Project with Cloudflare

```bash
# Create Next.js project with Cloudflare
npm create cloudflare@latest carnatic-xyz -- --framework=next

# Navigate to project
cd carnatic-xyz
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install drizzle-orm drizzle-kit
npm install @clerk/nextjs
npm install @cloudflare/next-on-pages
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
npm install @radix-ui/react-select @radix-ui/react-avatar @radix-ui/react-tooltip
npm install sonner react-hook-form zod
npm install date-fns

# Dev dependencies
npm install -D @cloudflare/workers-types wrangler
npm install -D @types/node
```

### Step 3: Project Structure Setup

```
carnatic-xyz/
├── app/                      # Next.js app directory
├── components/               # React components
│   ├── ui/                  # shadcn/ui components
│   ├── ragas/               # Raga-specific components
│   ├── compositions/        # Composition components
│   └── learn/               # Learning hub components
├── drizzle/                 # Database schema and migrations
│   ├── schema.ts
│   └── migrations/
├── functions/               # Cloudflare Pages Functions (API routes)
│   └── api/
├── lib/                     # Utility functions
│   ├── utils.ts
│   ├── db.ts
│   └── constants.ts
├── public/                  # Static assets
├── scripts/                 # Seed and migration scripts
│   └── seed.ts
├── types/                   # TypeScript type definitions
├── .dev.vars               # Local environment variables
├── wrangler.toml           # Cloudflare configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

---

## DATABASE SCHEMA

Create `drizzle/schema.ts`:

```typescript
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ========================================
// RAGAS TABLE
// ========================================
export const ragas = sqliteTable('ragas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  melakarta: text('melakarta'), // Parent melakarta if janya raga
  arohanam: text('arohanam').notNull(), // Ascending scale (e.g., "S R G M P D N S")
  avarohanam: text('avarohanam').notNull(), // Descending scale
  type: text('type').notNull(), // 'melakarta' | 'janya' | 'ghana'
  prahar: text('prahar'), // Time of day (e.g., "morning", "evening", "night")
  rasa: text('rasa'), // Emotional mood (e.g., "devotional", "romantic", "heroic")
  description: text('description'),
  characteristicPhrases: text('characteristic_phrases'), // JSON array of signature phrases
  averageRating: real('average_rating').default(0),
  totalRatings: integer('total_ratings').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
  slugIdx: index('slug_idx').on(table.slug),
  typeIdx: index('type_idx').on(table.type),
}));

// ========================================
// COMPOSERS TABLE
// ========================================
export const composers = sqliteTable('composers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  period: text('period'), // e.g., "1767-1847"
  biography: text('biography'),
  notableWorks: text('notable_works'), // JSON array
  imageUrl: text('image_url'),
  birthPlace: text('birth_place'),
  language: text('language'), // Primary composition language
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  nameIdx: index('composer_name_idx').on(table.name),
  slugIdx: index('composer_slug_idx').on(table.slug),
}));

// ========================================
// COMPOSITIONS/LYRICS TABLE
// ========================================
export const compositions = sqliteTable('compositions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  composerId: integer('composer_id').notNull().references(() => composers.id),
  ragaId: integer('raga_id').references(() => ragas.id),
  tala: text('tala'), // Rhythm cycle (e.g., "Adi", "Rupaka", "Khanda Chapu")
  type: text('type').notNull(), // 'kriti' | 'varnam' | 'keertana' | 'padam' | 'javali' | 'tillana'
  language: text('language').notNull(), // 'telugu' | 'tamil' | 'sanskrit' | 'kannada'
  
  // Lyrics in multiple formats
  lyricsOriginal: text('lyrics_original').notNull(), // Original script
  lyricsTransliterated: text('lyrics_transliterated'), // Roman script
  lyricsTranslated: text('lyrics_translated'), // English translation
  meaning: text('meaning'), // Bhava/meaning explanation
  
  notation: text('notation'), // Swara notation (JSON format)
  audioUrl: text('audio_url'), // R2 URL
  difficulty: text('difficulty'), // 'beginner' | 'intermediate' | 'advanced'
  duration: integer('duration'), // in seconds
  tempo: text('tempo'), // 'slow' | 'medium' | 'fast'
  
  // Metadata
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  slugIdx: index('comp_slug_idx').on(table.slug),
  ragaIdx: index('comp_raga_idx').on(table.ragaId),
  composerIdx: index('comp_composer_idx').on(table.composerId),
  typeIdx: index('comp_type_idx').on(table.type),
  difficultyIdx: index('comp_difficulty_idx').on(table.difficulty),
}));

// ========================================
// USER RATINGS (for Ragas)
// ========================================
export const ragaRatings = sqliteTable('raga_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // Clerk user ID
  ragaId: integer('raga_id').notNull().references(() => ragas.id),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userRagaIdx: index('user_raga_idx').on(table.userId, table.ragaId),
  ragaIdx: index('rating_raga_idx').on(table.ragaId),
}));

// ========================================
// COMMUNITY QUESTIONS (Learning Hub)
// ========================================
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  username: text('username').notNull(), // Denormalized for performance
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  body: text('body').notNull(), // Markdown supported
  tags: text('tags'), // JSON array: ['beginner', 'gamakas', 'shankarabharanam']
  views: integer('views').default(0),
  upvotes: integer('upvotes').default(0),
  answerCount: integer('answer_count').default(0),
  acceptedAnswerId: integer('accepted_answer_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  slugIdx: index('question_slug_idx').on(table.slug),
  userIdx: index('question_user_idx').on(table.userId),
  tagsIdx: index('question_tags_idx').on(table.tags),
}));

// ========================================
// ANSWERS
// ========================================
export const answers = sqliteTable('answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  body: text('body').notNull(), // Markdown supported
  upvotes: integer('upvotes').default(0),
  isAccepted: integer('is_accepted', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  questionIdx: index('answer_question_idx').on(table.questionId),
  userIdx: index('answer_user_idx').on(table.userId),
}));

// ========================================
// VOTES (for Questions and Answers)
// ========================================
export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  targetType: text('target_type').notNull(), // 'question' | 'answer'
  targetId: integer('target_id').notNull(),
  voteType: integer('vote_type').notNull(), // 1 for upvote, -1 for downvote
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userTargetIdx: index('vote_user_target_idx').on(table.userId, table.targetType, table.targetId),
}));

// ========================================
// USER AUDIO UPLOADS (Practice Recordings)
// ========================================
export const userAudios = sqliteTable('user_audios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  compositionId: integer('composition_id').references(() => compositions.id),
  ragaId: integer('raga_id').references(() => ragas.id),
  audioUrl: text('audio_url').notNull(), // R2 URL
  duration: integer('duration'), // in seconds
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  likes: integer('likes').default(0),
  plays: integer('plays').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdx: index('audio_user_idx').on(table.userId),
  compositionIdx: index('audio_composition_idx').on(table.compositionId),
  publicIdx: index('audio_public_idx').on(table.isPublic),
}));

// ========================================
// PRACTICE RESOURCES
// ========================================
export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull(), // 'exercise' | 'lesson' | 'video' | 'pdf' | 'article'
  category: text('category').notNull(), // 'sarali' | 'janta' | 'alankaram' | 'varnam' | 'kriti' | 'theory'
  difficulty: text('difficulty').notNull(), // 'beginner' | 'intermediate' | 'advanced'
  description: text('description'),
  content: text('content'), // Markdown content or URL
  audioUrl: text('audio_url'), // R2 URL for audio resources
  order: integer('order').default(0), // For curriculum ordering
  views: integer('views').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  slugIdx: index('resource_slug_idx').on(table.slug),
  categoryIdx: index('resource_category_idx').on(table.category),
  difficultyIdx: index('resource_difficulty_idx').on(table.difficulty),
}));

// ========================================
// USER PROGRESS (Learning Tracking)
// ========================================
export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  resourceId: integer('resource_id').notNull().references(() => resources.id),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  notes: text('notes'),
}, (table) => ({
  userResourceIdx: index('progress_user_resource_idx').on(table.userId, table.resourceId),
}));

// ========================================
// COMMENTS (for Compositions and User Audios)
// ========================================
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  targetType: text('target_type').notNull(), // 'composition' | 'audio' | 'raga'
  targetId: integer('target_id').notNull(),
  body: text('body').notNull(),
  upvotes: integer('upvotes').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  targetIdx: index('comment_target_idx').on(table.targetType, table.targetId),
}));

// ========================================
// ANNOTATIONS (for Lyrics)
// ========================================
export const annotations = sqliteTable('annotations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  compositionId: integer('composition_id').notNull().references(() => compositions.id),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  lineNumber: integer('line_number').notNull(), // Which line of lyrics
  annotation: text('annotation').notNull(),
  upvotes: integer('upvotes').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  compositionIdx: index('annotation_composition_idx').on(table.compositionId),
}));

// ========================================
// RELATIONS
// ========================================
export const ragasRelations = relations(ragas, ({ many }) => ({
  compositions: many(compositions),
  ratings: many(ragaRatings),
  userAudios: many(userAudios),
}));

export const composersRelations = relations(composers, ({ many }) => ({
  compositions: many(compositions),
}));

export const compositionsRelations = relations(compositions, ({ one, many }) => ({
  composer: one(composers, {
    fields: [compositions.composerId],
    references: [composers.id],
  }),
  raga: one(ragas, {
    fields: [compositions.ragaId],
    references: [ragas.id],
  }),
  annotations: many(annotations),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const resourcesRelations = relations(resources, ({ many }) => ({
  progress: many(userProgress),
}));
```

---

## CLOUDFLARE CONFIGURATION

### Step 1: Create `wrangler.toml`

```toml
name = "carnatic-xyz"
compatibility_date = "2026-03-01"
pages_build_output_dir = ".vercel/output/static"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "carnatic-music-db"
database_id = "" # Will be filled after creation

# R2 Storage (for audio files)
[[r2_buckets]]
binding = "AUDIO_BUCKET"
bucket_name = "carnatic-audio"

# KV Namespace (for caching)
[[kv_namespaces]]
binding = "CACHE"
id = "" # Will be filled after creation

# Environment variables
[vars]
NEXT_PUBLIC_APP_URL = "https://carnatic.xyz"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.preview]
vars = { ENVIRONMENT = "preview" }
```

### Step 2: Create Cloudflare Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create carnatic-music-db
# Copy the database_id output to wrangler.toml

# Create R2 bucket
wrangler r2 bucket create carnatic-audio

# Create KV namespace
wrangler kv:namespace create "CACHE"
# Copy the id output to wrangler.toml

# Create preview KV namespace
wrangler kv:namespace create "CACHE" --preview
```

### Step 3: Create `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml',
    dbName: 'carnatic-music-db',
  },
} satisfies Config;
```

### Step 4: Create `.dev.vars` (Local Environment Variables)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Generate and Apply Migrations

```bash
# Generate migrations from schema
npx drizzle-kit generate:sqlite

# Apply migrations locally (for testing)
wrangler d1 migrations apply carnatic-music-db --local

# Apply migrations to production
wrangler d1 migrations apply carnatic-music-db
```

---

## API ROUTES STRUCTURE

Cloudflare Pages Functions follow this structure:

```
functions/
├── api/
│   ├── ragas/
│   │   ├── index.ts                # GET /api/ragas (list all)
│   │   ├── [slug].ts               # GET /api/ragas/[slug] (detail)
│   │   ├── [slug]/rate.ts          # POST /api/ragas/[slug]/rate
│   │   └── [slug]/comments.ts      # GET/POST /api/ragas/[slug]/comments
│   ├── compositions/
│   │   ├── index.ts                # GET /api/compositions (list)
│   │   ├── [slug].ts               # GET /api/compositions/[slug]
│   │   ├── [slug]/annotations.ts   # GET/POST annotations
│   │   ├── search.ts               # GET /api/compositions/search
│   │   └── by-raga/[ragaSlug].ts  # GET compositions by raga
│   ├── composers/
│   │   ├── index.ts                # GET /api/composers
│   │   └── [slug].ts               # GET /api/composers/[slug]
│   ├── questions/
│   │   ├── index.ts                # GET/POST /api/questions
│   │   ├── [slug].ts               # GET /api/questions/[slug]
│   │   ├── [slug]/answers.ts       # GET/POST answers
│   │   └── [slug]/vote.ts          # POST upvote/downvote
│   ├── answers/
│   │   ├── [id]/vote.ts            # POST vote on answer
│   │   └── [id]/accept.ts          # POST accept answer
│   ├── audio/
│   │   ├── upload.ts               # POST /api/audio/upload
│   │   ├── [id].ts                 # GET /api/audio/[id]
│   │   └── [id]/like.ts            # POST like audio
│   ├── resources/
│   │   ├── index.ts                # GET /api/resources
│   │   ├── [slug].ts               # GET /api/resources/[slug]
│   │   └── progress.ts             # GET/POST user progress
│   └── search/
│       └── global.ts               # GET /api/search/global?q=...
```

### Example API Route: `functions/api/ragas/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { ragas } from '../../../drizzle/schema';
import { eq, desc, asc, like, or } from 'drizzle-orm';

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = drizzle(context.env.DB);
  const url = new URL(context.request.url);
  
  // Query parameters
  const type = url.searchParams.get('type'); // melakarta, janya, ghana
  const sortBy = url.searchParams.get('sort') || 'name'; // name, rating, popular
  const search = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  // Try cache first
  const cacheKey = `ragas:${type}:${sortBy}:${search}:${limit}:${offset}`;
  const cached = await context.env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
  
  try {
    let query = db.select().from(ragas);
    
    // Apply filters
    if (type) {
      query = query.where(eq(ragas.type, type));
    }
    
    if (search) {
      query = query.where(
        or(
          like(ragas.name, `%${search}%`),
          like(ragas.description, `%${search}%`)
        )
      );
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      query = query.orderBy(desc(ragas.averageRating));
    } else if (sortBy === 'popular') {
      query = query.orderBy(desc(ragas.totalRatings));
    } else {
      query = query.orderBy(asc(ragas.name));
    }
    
    query = query.limit(limit).offset(offset);
    
    const result = await query.all();
    
    // Get total count for pagination
    const totalQuery = await db.select({ count: ragas.id }).from(ragas);
    const total = totalQuery.length;
    
    const response = {
      ragas: result,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
    
    const responseStr = JSON.stringify(response);
    
    // Cache for 5 minutes
    await context.env.CACHE.put(cacheKey, responseStr, { expirationTtl: 300 });
    
    return new Response(responseStr, {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching ragas:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch ragas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Example: R2 Audio Upload - `functions/api/audio/upload.ts`

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { userAudios } from '../../../drizzle/schema';

interface Env {
  AUDIO_BUCKET: R2Bucket;
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Get user from Clerk (you'll need to verify auth token)
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const formData = await context.request.formData();
  const file = formData.get('audio') as File;
  const userId = formData.get('userId') as string;
  const username = formData.get('username') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isPublic = formData.get('isPublic') === 'true';
  const compositionId = formData.get('compositionId') 
    ? parseInt(formData.get('compositionId') as string) 
    : null;
  
  if (!file || !userId || !title) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Validate file type
  if (!file.type.startsWith('audio/')) {
    return new Response(JSON.stringify({ error: 'Invalid file type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Validate file size (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: 'File too large (max 50MB)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const extension = file.name.split('.').pop();
    const filename = `${userId}/${timestamp}-${sanitizedTitle}.${extension}`;
    
    // Upload to R2
    await context.env.AUDIO_BUCKET.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        userId,
        title,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    // Store metadata in D1
    const audioUrl = `https://cdn.carnatic.xyz/${filename}`;
    
    const db = drizzle(context.env.DB);
    const result = await db.insert(userAudios).values({
      userId,
      username,
      title,
      description,
      compositionId,
      audioUrl,
      duration: null, // Could be calculated client-side
      isPublic,
      createdAt: new Date(),
    }).returning();
    
    return new Response(JSON.stringify(result[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

---

## FRONTEND APPLICATION STRUCTURE

```
app/
├── layout.tsx                      # Root layout with Clerk provider
├── page.tsx                        # Homepage (hero + featured content)
├── globals.css                     # Global styles
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── ragas/
│   ├── page.tsx                    # Ragas grid/list with filters
│   ├── [slug]/
│   │   ├── page.tsx                # Raga detail page
│   │   └── loading.tsx
│   └── loading.tsx
├── compositions/
│   ├── page.tsx                    # Compositions library
│   ├── [slug]/
│   │   ├── page.tsx                # Composition detail + lyrics
│   │   └── loading.tsx
│   └── loading.tsx
├── composers/
│   ├── page.tsx                    # Composers directory
│   ├── [slug]/
│   │   └── page.tsx                # Composer profile + works
│   └── loading.tsx
├── learn/
│   ├── page.tsx                    # Learning hub home
│   ├── resources/
│   │   ├── page.tsx                # Structured curriculum
│   │   └── [slug]/page.tsx         # Resource detail
│   ├── questions/
│   │   ├── page.tsx                # Q&A list
│   │   ├── ask/
│   │   │   └── page.tsx            # Ask question form
│   │   ├── [slug]/
│   │   │   └── page.tsx            # Question detail + answers
│   │   └── loading.tsx
│   └── tools/
│       ├── tanpura/page.tsx        # Virtual tanpura
│       └── metronome/page.tsx      # Metronome with talas
├── community/
│   ├── page.tsx                    # Community feed
│   ├── uploads/
│   │   ├── page.tsx                # User audio grid
│   │   └── [id]/page.tsx           # Audio detail
│   └── upload/
│       └── page.tsx                # Upload form
├── search/
│   └── page.tsx                    # Global search results
├── profile/
│   ├── [userId]/
│   │   ├── page.tsx                # User profile
│   │   └── edit/page.tsx           # Edit profile
│   └── settings/
│       └── page.tsx                # User settings
├── about/
│   └── page.tsx                    # About the platform
└── api/                            # Client-side API utilities
    ├── ragas.ts
    ├── compositions.ts
    ├── questions.ts
    └── audio.ts
```

---

## KEY FEATURES

### 1. Raga Discovery Platform

#### Homepage (`app/ragas/page.tsx`)

**Features:**
- Grid/list view toggle
- Filters:
  - Type: Melakarta, Janya, Ghana
  - Prahar (time of day): Morning, Afternoon, Evening, Night
  - Rasa (mood): Devotional, Romantic, Heroic, Serene
- Search autocomplete with debouncing
- "Raga of the Day" featured card (rotates daily)
- Sort options: Name (A-Z), Rating (high to low), Popularity
- Infinite scroll pagination

**UI Components:**
- `<RagaCard>` - Card display with image, name, type, rating
- `<RagaFilters>` - Filter sidebar/panel
- `<RagaSearch>` - Search input with suggestions
- `<RagaGrid>` - Responsive grid layout

#### Detail Page (`app/ragas/[slug]/page.tsx`)

**Features:**
- Hero section with raga name, type, and average rating
- **Scale Display:**
  - Arohanam (ascending): S R G M P D N S
  - Avarohanam (descending): S N D P M G R S
  - Interactive: Click notes to hear them (web audio API)
- **Characteristic Phrases:**
  - Text display of signature sanchara patterns
  - Audio examples for each phrase
- **Metadata:**
  - Time of day (prahar)
  - Emotional mood (rasa)
  - Parent melakarta (if janya raga)
  - Description and history
- **Related Ragas:**
  - Parent melakarta
  - Sibling janya ragas
  - Similar ragas
- **Compositions in this Raga:**
  - List of famous kritis/varnams
  - Links to composition pages
- **Community Section:**
  - Star rating (1-5) with average display
  - User reviews with upvote/downvote
  - Comment thread
- **Practice Resources:**
  - Exercises in this raga
  - Video lessons
  - PDF downloads

**UI Components:**
- `<ScaleDisplay>` - Interactive scale visualization
- `<RatingWidget>` - Star rating input
- `<ReviewsList>` - User reviews with voting
- `<CommentThread>` - Nested comments

### 2. Lyrics & Notation Library

#### Compositions List (`app/compositions/page.tsx`)

**Features:**
- Table view with columns:
  - Title
  - Composer
  - Raga
  - Tala
  - Type (Kriti, Varnam, etc.)
  - Language
  - Difficulty
- Advanced filters:
  - By raga (dropdown with search)
  - By composer
  - By type
  - By language
  - By difficulty level
- Sort by: Title, Composer, Popularity, Date Added
- Search with fuzzy matching
- Infinite scroll or pagination

**UI Components:**
- `<CompositionsTable>` - Sortable, filterable table
- `<CompositionFilters>` - Multi-select filters
- `<CompositionRow>` - Table row with quick actions

#### Composition Detail (`app/compositions/[slug]/page.tsx`)

**Features:**
- **Header:**
  - Title
  - Composer (linked)
  - Raga (linked)
  - Tala
  - Language
  - Difficulty badge
- **Tabbed Interface:**
  1. **Lyrics Tab:**
     - Original script (Tamil/Telugu/Sanskrit/Kannada)
     - Transliterated (Roman script)
     - Translated (English)
     - Line-by-line display
  2. **Notation Tab:**
     - Swara notation in sections (Pallavi, Anupallavi, Charanam)
     - Color-coded swaras
     - Ability to play each line
  3. **Meaning Tab:**
     - Bhava (emotional interpretation)
     - Literary analysis
     - Mythology/context
  4. **Audio Tab:**
     - Reference recordings from R2
     - Multiple renditions if available
- **Audio Player with Lyrics Sync:**
  - Custom audio player
  - Current line highlighted as audio plays
  - Seek to any line by clicking
  - Playback controls: play/pause, speed (0.5x - 2x), loop section
- **Community Annotations:**
  - Click any line to view/add annotations
  - Upvote helpful annotations
  - Filter by top-rated
- **Practice Features:**
  - Download PDF notation
  - Download audio
  - Add to practice playlist

**UI Components:**
- `<LyricsSyncPlayer>` - Custom audio player with line highlighting
- `<NotationDisplay>` - Render swara notation with formatting
- `<AnnotationPopover>` - Click-to-annotate interface
- `<TabsInterface>` - Smooth tab switching

### 3. Learning Hub & Community Q&A

#### Q&A Platform (`app/learn/questions/page.tsx`)

**Features:**
- Stack Overflow-style interface
- Question cards showing:
  - Title
  - Excerpt of body
  - Tags
  - Vote count
  - Answer count
  - Views
  - Author avatar + name
  - Timestamp
- Sort options:
  - Recent (newest first)
  - Popular (most votes)
  - Unanswered (no accepted answer)
  - Most Viewed
- Tag filtering (click tag to filter)
- Search questions

**UI Components:**
- `<QuestionCard>` - Compact question display
- `<QuestionList>` - List with sorting/filtering
- `<TagBadge>` - Clickable tag chips

#### Ask Question (`app/learn/questions/ask/page.tsx`)

**Features:**
- Title input (required)
- Markdown editor for body
- Tag input (autocomplete from existing tags)
- Preview mode
- Draft auto-save to localStorage

**UI Components:**
- `<MarkdownEditor>` - Rich text editor with preview
- `<TagInput>` - Multi-select tag input with suggestions

#### Question Detail (`app/learn/questions/[slug]/page.tsx`)

**Features:**
- **Question Section:**
  - Full question body (markdown rendered)
  - Vote buttons (upvote/downvote)
  - Edit button (if author)
  - Tags
  - Metadata (author, timestamp, views)
- **Answers Section:**
  - Sorted by: Votes, Accepted, Recent
  - Each answer has:
    - Body (markdown)
    - Vote buttons
    - Accept button (if question author)
    - Edit button (if answer author)
    - Comments
  - Accepted answer highlighted with checkmark
- **Answer Input:**
  - Markdown editor
  - Preview mode
  - Submit button

**UI Components:**
- `<QuestionDetail>` - Render question with voting
- `<AnswersList>` - Sortable list of answers
- `<AnswerEditor>` - Editor for submitting answers
- `<VoteButtons>` - Upvote/downvote with counts

#### Resources Section (`app/learn/resources/page.tsx`)

**Features:**
- **Curriculum Structure:**
  - Beginner Level:
    - Sarali Varisai (basic exercises)
    - Janta Varisai
    - Alankarams
  - Intermediate Level:
    - Geetams
    - Swarajatis
    - Simple Varnams
  - Advanced Level:
    - Complex Varnams
    - Kritis
    - Advanced Techniques
- Each resource shows:
  - Title
  - Difficulty badge
  - Duration/length
  - Completion status (if logged in)
  - Audio preview button
- Click to view full resource
- Progress tracking bar

**UI Components:**
- `<CurriculumSection>` - Collapsible curriculum sections
- `<ResourceCard>` - Resource display with progress
- `<ProgressBar>` - Visual progress indicator

#### Practice Tools

**Virtual Tanpura (`app/learn/tools/tanpura/page.tsx`):**
- Pitch selector (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- Octave selector (Mandra, Madhya, Tara)
- Volume control
- Play/stop button
- Male/female voice option
- Uses Web Audio API for synthesis

**Metronome (`app/learn/tools/metronome/page.tsx`):**
- Tempo slider (40-240 BPM)
- Tala selector:
  - Adi (8 beats)
  - Rupaka (6 beats)
  - Khanda Chapu (5 beats)
  - Misra Chapu (7 beats)
  - Jhampa (10 beats)
- Visual beat indicator (highlights current beat)
- Accent first beat (louder)
- Play/stop button
- Tap tempo feature

**UI Components:**
- `<TanpuraWidget>` - Interactive tanpura controls
- `<MetronomeWidget>` - Visual + audio metronome

---

## UI COMPONENTS

### Install shadcn/ui Components

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add command
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
```

### Custom Component Examples

#### `components/ragas/RagaCard.tsx`

```typescript
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface RagaCardProps {
  raga: {
    slug: string;
    name: string;
    type: string;
    averageRating: number;
    totalRatings: number;
    description?: string;
    prahar?: string;
    rasa?: string;
  };
}

export function RagaCard({ raga }: RagaCardProps) {
  return (
    <Link href={`/ragas/${raga.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold">{raga.name}</h3>
            <Badge variant={raga.type === 'melakarta' ? 'default' : 'secondary'}>
              {raga.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {raga.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {raga.description}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {raga.prahar && (
              <Badge variant="outline" className="text-xs">
                {raga.prahar}
              </Badge>
            )}
            {raga.rasa && (
              <Badge variant="outline" className="text-xs">
                {raga.rasa}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{raga.averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({raga.totalRatings} ratings)
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
```

#### `components/compositions/LyricsSyncPlayer.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface LyricLine {
  time: number; // Timestamp in seconds
  text: string;
}

interface LyricsSyncPlayerProps {
  audioUrl: string;
  lyrics: LyricLine[];
}

export function LyricsSyncPlayer({ audioUrl, lyrics }: LyricsSyncPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    // Find current line based on time
    const index = lyrics.findIndex((line, i) => {
      const nextLine = lyrics[i + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
    if (index !== -1) setCurrentLineIndex(index);
  }, [currentTime, lyrics]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekToLine = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = lyrics[index].time;
  };

  const changeSpeed = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Lyrics Display */}
      <div className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-2">
        {lyrics.map((line, index) => (
          <div
            key={index}
            onClick={() => seekToLine(index)}
            className={`cursor-pointer p-2 rounded transition-colors ${
              index === currentLineIndex
                ? 'bg-carnatic-100 dark:bg-carnatic-900 font-semibold'
                : 'hover:bg-muted'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={(value) => {
            const audio = audioRef.current;
            if (audio) audio.currentTime = value[0];
          }}
        />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const audio = audioRef.current;
              if (audio) audio.currentTime -= 10;
            }}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            onClick={togglePlay}
            className="w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const audio = audioRef.current;
              if (audio) audio.currentTime += 10;
            }}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Speed:</span>
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <Button
              key={speed}
              variant={playbackRate === speed ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeSpeed(speed)}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## AUTHENTICATION

### Setup Clerk

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy API keys to `.dev.vars`
4. Configure sign-in/sign-up pages

### `app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'carnatic.xyz - Carnatic Music Platform',
  description: 'Discover ragas, learn compositions, and connect with the Carnatic music community',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Protected Routes Middleware

Create `middleware.ts`:

```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/ragas(.*)',
    '/compositions(.*)',
    '/composers(.*)',
    '/learn/resources(.*)',
    '/learn/questions(.*)',
    '/api/ragas(.*)',
    '/api/compositions(.*)',
    '/api/questions(.*)',
    '/search(.*)',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## SEED DATA

Create `scripts/seed.ts`:

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { ragas, composers, compositions } from '../drizzle/schema';

// Sample seed data
const seedData = {
  ragas: [
    {
      name: 'Shankarabharanam',
      slug: 'shankarabharanam',
      arohanam: 'S R G M P D N S',
      avarohanam: 'S N D P M G R S',
      type: 'melakarta',
      prahar: 'evening',
      rasa: 'devotional',
      description: 'The 29th melakarta raga, equivalent to the major scale in Western music. Known for its grandeur and majesty.',
      characteristicPhrases: JSON.stringify(['M P D S', 'S R G M P', 'P M G R S']),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Mohanam',
      slug: 'mohanam',
      melakarta: 'Shankarabharanam',
      arohanam: 'S R G P D S',
      avarohanam: 'S D P G R S',
      type: 'janya',
      prahar: 'evening',
      rasa: 'serene',
      description: 'A pentatonic janya raga of Shankarabharanam. Popular for its pleasant and soothing character.',
      characteristicPhrases: JSON.stringify(['S R G P', 'P D S', 'S D P G R S']),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more ragas...
  ],
  composers: [
    {
      name: 'Thyagaraja',
      slug: 'thyagaraja',
      period: '1767-1847',
      biography: 'One of the Trinity of Carnatic music, composed thousands of devotional songs in Telugu.',
      notableWorks: JSON.stringify([
        'Endaro Mahanubhavulu',
        'Rama Nee Samana',
        'Jagadananda Karaka',
      ]),
      birthPlace: 'Tiruvarur, Tamil Nadu',
      language: 'Telugu',
      createdAt: new Date(),
    },
    // Add more composers...
  ],
  compositions: [
    {
      title: 'Endaro Mahanubhavulu',
      slug: 'endaro-mahanubhavulu',
      composerId: 1, // Thyagaraja
      ragaId: 1, // Shankarabharanam
      tala: 'Adi',
      type: 'kriti',
      language: 'telugu',
      lyricsOriginal: `ఎందరో మహానుభావులు అందరికీ వందనములు...`,
      lyricsTransliterated: `Endaro mahanubhavulu andariki vandanamulu...`,
      lyricsTranslated: `Salutations to all the great souls...`,
      meaning: 'Thyagaraja pays homage to all great bhaktas and musicians.',
      difficulty: 'intermediate',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more compositions...
  ],
};

// Run seed function
async function seed() {
  // Implementation depends on how you access D1 in scripts
  console.log('Seeding database...');
  console.log('Seed data prepared');
}

seed();
```

Run seed:

```bash
# Create a seed script in package.json
npm run seed
```

---

## STYLING

### Update `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Carnatic-themed colors
        carnatic: {
          50: '#fef7ee',
          100: '#fdedd7',
          200: '#fad8ae',
          300: '#f7bb7a',
          400: '#f39344',
          500: '#f0741f',
          600: '#e15915',
          700: '#ba4213',
          800: '#943517',
          900: '#782e15',
        },
        tanpura: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### Add Google Fonts to `app/layout.tsx`

```typescript
import { Inter, Merriweather, Noto_Sans_Tamil, Noto_Sans_Telugu } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({ 
  weight: ['400', '700'], 
  subsets: ['latin'],
  variable: '--font-serif',
});
const tamil = Noto_Sans_Tamil({ subsets: ['tamil'], variable: '--font-tamil' });
const telugu = Noto_Sans_Telugu({ subsets: ['telugu'], variable: '--font-telugu' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${merriweather.variable} ${tamil.variable} ${telugu.variable}`}>
        <body className="font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## DEPLOYMENT

### Step 1: Build Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.carnatic.xyz'],
  },
};

module.exports = nextConfig;
```

### Step 2: Build and Preview Locally

```bash
# Install Pages build adapter
npm install @cloudflare/next-on-pages

# Build for Cloudflare Pages
npm run pages:build

# Preview locally with Wrangler
npm run preview
```

### Step 3: Deploy to Cloudflare Pages

**Option A: CLI Deployment**

```bash
# Deploy via Wrangler
wrangler pages deploy .vercel/output/static --project-name=carnatic-xyz
```

**Option B: GitHub Integration (Recommended)**

1. Push code to GitHub repository
2. Go to Cloudflare Dashboard → Workers & Pages
3. Click "Create application" → "Pages" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.vercel/output/static`
   - Environment variables: Add all from `.dev.vars`
6. Click "Save and Deploy"

### Step 4: Configure Custom Domain

1. In Cloudflare Pages project settings
2. Go to "Custom domains"
3. Add `carnatic.xyz`
4. Add `www.carnatic.xyz` (with redirect to apex)
5. DNS records automatically created
6. SSL certificate auto-provisions (24 hours)

### Step 5: Configure R2 Public Domain

1. Go to R2 → `carnatic-audio` bucket
2. Settings → Custom Domains
3. Add `cdn.carnatic.xyz`
4. Update all `audioUrl` references in code

### Step 6: Environment Variables

Add to Cloudflare Pages settings:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://carnatic.xyz
OPENAI_API_KEY=sk-...
```

---

## ADVANCED FEATURES

### AI-Powered Raga Identification

**Flow:**
1. User uploads audio snippet (max 30 seconds)
2. Upload to R2 temporary storage
3. Call OpenAI Whisper API for transcription (if vocal)
4. Use audio embeddings or custom model to identify raga
5. Return top 3 matches with confidence scores

**Implementation:**

```typescript
// functions/api/ai/identify-raga.ts
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  const audioFile = formData.get('audio') as File;
  
  // Upload to temporary R2 location
  const tempKey = `temp/${Date.now()}-${audioFile.name}`;
  await context.env.AUDIO_BUCKET.put(tempKey, audioFile.stream());
  
  // Call OpenAI or custom model
  // Return predictions
  
  // Clean up temp file after processing
  await context.env.AUDIO_BUCKET.delete(tempKey);
  
  return new Response(JSON.stringify({
    predictions: [
      { raga: 'Shankarabharanam', confidence: 0.87 },
      { raga: 'Kalyani', confidence: 0.09 },
      { raga: 'Mohanam', confidence: 0.04 },
    ],
  }));
};
```

### Real-time Collaboration (Durable Objects)

For live practice sessions, shared notation editing, etc.

**Setup:**
```bash
# Add Durable Objects binding to wrangler.toml
[[durable_objects.bindings]]
name = "SESSIONS"
class_name = "PracticeSession"
```

### Gamification System

**Badges:**
- "Explorer": Viewed 10 ragas
- "Scholar": Completed 5 learning resources
- "Teacher": Posted 10 helpful answers
- "Performer": Uploaded 5 recordings

**Implementation:**
- Create `badges` and `user_badges` tables
- Award badges based on activity counters
- Display on user profiles

### Mobile PWA

Add `public/manifest.json`:

```json
{
  "name": "carnatic.xyz",
  "short_name": "Carnatic",
  "description": "Carnatic Music Learning Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f0741f",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `app/layout.tsx`:

```typescript
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#f0741f',
};
```

---

## PERFORMANCE & SECURITY

### Performance Optimizations

1. **Edge Caching with KV:**
   - Cache frequently accessed ragas/compositions
   - 5-minute TTL for most data
   - Invalidate on updates

2. **Image Optimization:**
   - Use Cloudflare Images for composer portraits
   - Lazy load images with Next.js `<Image>`

3. **Code Splitting:**
   - Use `React.lazy()` for heavy components
   - Dynamic imports for tools (tanpura, metronome)

4. **Database Indexing:**
   - Already defined in schema
   - Monitor query performance

5. **Audio Streaming:**
   - Use R2 range requests
   - Stream large audio files

### Security Measures

1. **Rate Limiting:**

```typescript
// middleware.ts or API routes
const rateLimiter = new Map();

function checkRateLimit(ip: string, limit = 100, window = 60000) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < window);
  
  if (recentRequests.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}
```

2. **Input Validation:**

```typescript
import { z } from 'zod';

const questionSchema = z.object({
  title: z.string().min(10).max(200),
  body: z.string().min(50).max(10000),
  tags: z.array(z.string()).min(1).max(5),
});
```

3. **XSS Prevention:**
   - Sanitize user-generated content
   - Use DOMPurify for HTML sanitization

4. **CSRF Protection:**
   - Clerk provides built-in CSRF protection
   - Verify tokens on sensitive operations

5. **Content Moderation:**
   - Flag inappropriate uploads
   - Admin review queue
   - Community reporting system

---

## DEVELOPMENT ROADMAP

### Week 1: Foundation
- ✅ Project setup and configuration
- ✅ Database schema and migrations
- ✅ Basic API routes (ragas, compositions)
- ✅ Authentication with Clerk

### Week 2: Ragas Module
- ✅ Ragas list page with filters
- ✅ Raga detail page
- ✅ Rating and review system
- ✅ Interactive scale display

### Week 3: Compositions Module
- ✅ Compositions library with search
- ✅ Composition detail page
- ✅ Lyrics tabs (original/transliterated/translated)
- ✅ Basic audio player

### Week 4: Learning Hub
- ✅ Q&A platform (questions list)
- ✅ Question detail with answers
- ✅ Ask question form
- ✅ Voting system

### Week 5: Community Features
- ✅ Audio upload functionality
- ✅ User profiles
- ✅ Practice resources section
- ✅ Comments system

### Week 6: Polish & Deploy
- ✅ Virtual tanpura tool
- ✅ Metronome tool
- ✅ Synced lyrics player
- ✅ SEO optimization
- ✅ Final testing
- ✅ Production deployment

### Phase 2 (Post-Launch)
- AI raga identification
- Mobile app (React Native)
- Real-time collaboration
- Advanced analytics
- Email newsletters
- Premium features

---

## COST BREAKDOWN

### Monthly Costs (for ~10,000 users)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| **Cloudflare Pages** | 500 builds/mo | ~50 builds | $0 |
| **Cloudflare Workers** | 100K req/day | ~2M requests | $0 |
| **D1 Database** | 5GB, 5M reads/day | 3GB, 2M reads | $0 |
| **R2 Storage** | 10GB | 50GB audio | $0.75 |
| **KV Namespace** | 1M reads/day | 500K reads | $0 |
| **Clerk Auth** | 10K MAU | 10K users | $0 |
| **Custom Domain** | Included | - | $0 |
| **SSL Certificate** | Included | - | $0 |
| **CDN/Bandwidth** | Unlimited | - | $0 |
| **Total** | | | **$0.75-$2/month** |

### Scaling Costs

At 50,000 users:
- R2: ~$5/month (250GB storage)
- Workers: ~$5/month (10M requests)
- Clerk: $25/month (25K MAU)
- **Total: ~$35/month**

At 100,000 users:
- R2: ~$10/month (500GB)
- Workers: ~$10/month (20M requests)
- D1: ~$5/month (larger database)
- Clerk: $25/month (with enterprise pricing)
- **Total: ~$50/month**

---

## TESTING STRATEGY

### Unit Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Test critical functions:
- API route handlers
- Data transformations
- Utility functions

### Integration Tests

Test user flows:
- Sign up → Browse ragas → Rate a raga
- Search composition → View lyrics → Play audio
- Ask question → Post answer → Vote

### E2E Tests (Optional)

```bash
npm install -D playwright
```

Test complete user journeys across pages.

---

## MONITORING & ANALYTICS

### Cloudflare Analytics

Built-in metrics:
- Request volume
- Error rates
- Response times
- Geographic distribution

### Custom Analytics

Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';
// Or use Cloudflare Web Analytics

<Analytics />
```

Track:
- Page views
- User engagement
- Popular ragas/compositions
- Search queries

---

## DOCUMENTATION

### API Documentation

Create `docs/api.md`:

```markdown
# carnatic.xyz API Documentation

## Ragas

### GET /api/ragas
List all ragas with optional filters.

**Query Parameters:**
- `type`: melakarta | janya | ghana
- `sort`: name | rating | popular
- `limit`: number (default 50)
- `offset`: number (default 0)

**Response:**
```json
{
  "ragas": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

...
```

### User Guide

Create help pages for:
- How to rate ragas
- How to upload audio
- How to ask good questions
- Notation conventions

---

## FINAL CHECKLIST

### Pre-Launch

- [ ] All seed data populated
- [ ] Authentication working
- [ ] All API routes functional
- [ ] Frontend pages responsive
- [ ] Audio upload/playback tested
- [ ] Search functionality working
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] SEO meta tags added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Contact page

### Launch Day

- [ ] Domain configured (carnatic.xyz)
- [ ] SSL certificate active
- [ ] Production environment variables set
- [ ] Database migrated to production
- [ ] R2 bucket configured
- [ ] CDN subdomain working (cdn.carnatic.xyz)
- [ ] Social media accounts created
- [ ] Launch announcement prepared
- [ ] Monitoring enabled

### Post-Launch

- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Plan Phase 2 features
- [ ] Community engagement
- [ ] Content moderation setup

---

## SUPPORT & RESOURCES

### Official Documentation

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Next.js](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Clerk](https://clerk.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Community

- r/CarnaticMusic
- Carnatic Music Forum
- Discord server (create one!)

---

## CONCLUSION

This comprehensive plan provides everything needed to build and deploy carnatic.xyz as a full-stack Carnatic music platform on Cloudflare's free tier.

**Key Advantages:**
- ✅ Virtually free hosting ($0-2/month)
- ✅ Global CDN with edge caching
- ✅ Scalable architecture
- ✅ Modern tech stack
- ✅ Rich feature set
- ✅ Room for growth

**Next Steps:**
1. Copy this plan to Cursor
2. Generate project structure
3. Implement features incrementally
4. Test thoroughly
5. Deploy to production
6. Launch and iterate!

**Estimated Total Development Time:** 6-8 weeks for MVP

Good luck building carnatic.xyz! 🎵🎼

---

*Last Updated: March 2, 2026*
*Version: 1.0*