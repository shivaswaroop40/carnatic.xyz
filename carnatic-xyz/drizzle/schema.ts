import {
	sqliteTable,
	text,
	integer,
	real,
	index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const ragas = sqliteTable(
	"ragas",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull().unique(),
		slug: text("slug").notNull().unique(),
		melakarta: text("melakarta"),
		arohanam: text("arohanam").notNull(),
		avarohanam: text("avarohanam").notNull(),
		type: text("type").notNull(),
		prahar: text("prahar"),
		rasa: text("rasa"),
		description: text("description"),
		characteristicPhrases: text("characteristic_phrases"),
		averageRating: real("average_rating").default(0),
		totalRatings: integer("total_ratings").default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		nameIdx: index("name_idx").on(table.name),
		slugIdx: index("slug_idx").on(table.slug),
		typeIdx: index("type_idx").on(table.type),
	}),
);

export const composers = sqliteTable(
	"composers",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull().unique(),
		slug: text("slug").notNull().unique(),
		period: text("period"),
		biography: text("biography"),
		notableWorks: text("notable_works"),
		imageUrl: text("image_url"),
		birthPlace: text("birth_place"),
		language: text("language"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		nameIdx: index("composer_name_idx").on(table.name),
		slugIdx: index("composer_slug_idx").on(table.slug),
	}),
);

export const compositions = sqliteTable(
	"compositions",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		composerId: integer("composer_id")
			.notNull()
			.references(() => composers.id),
		ragaId: integer("raga_id").references(() => ragas.id),
		tala: text("tala"),
		type: text("type").notNull(),
		language: text("language").notNull(),
		lyricsOriginal: text("lyrics_original").notNull(),
		lyricsTransliterated: text("lyrics_transliterated"),
		lyricsTranslated: text("lyrics_translated"),
		meaning: text("meaning"),
		notation: text("notation"),
		audioUrl: text("audio_url"),
		renditionUrls: text("rendition_urls"),
		difficulty: text("difficulty"),
		duration: integer("duration"),
		tempo: text("tempo"),
		views: integer("views").default(0),
		likes: integer("likes").default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		titleIdx: index("title_idx").on(table.title),
		slugIdx: index("comp_slug_idx").on(table.slug),
		ragaIdx: index("comp_raga_idx").on(table.ragaId),
		composerIdx: index("comp_composer_idx").on(table.composerId),
		typeIdx: index("comp_type_idx").on(table.type),
		difficultyIdx: index("comp_difficulty_idx").on(table.difficulty),
	}),
);

export const ragaRatings = sqliteTable(
	"raga_ratings",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").notNull(),
		ragaId: integer("raga_id")
			.notNull()
			.references(() => ragas.id),
		rating: integer("rating").notNull(),
		review: text("review"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userRagaIdx: index("user_raga_idx").on(table.userId, table.ragaId),
		ragaIdx: index("rating_raga_idx").on(table.ragaId),
	}),
);

export const questions = sqliteTable(
	"questions",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		body: text("body").notNull(),
		tags: text("tags"),
		views: integer("views").default(0),
		upvotes: integer("upvotes").default(0),
		answerCount: integer("answer_count").default(0),
		acceptedAnswerId: integer("accepted_answer_id"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		slugIdx: index("question_slug_idx").on(table.slug),
		userIdx: index("question_user_idx").on(table.userId),
		tagsIdx: index("question_tags_idx").on(table.tags),
	}),
);

export const answers = sqliteTable(
	"answers",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		questionId: integer("question_id")
			.notNull()
			.references(() => questions.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		body: text("body").notNull(),
		upvotes: integer("upvotes").default(0),
		isAccepted: integer("is_accepted", { mode: "boolean" }).default(false),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		questionIdx: index("answer_question_idx").on(table.questionId),
		userIdx: index("answer_user_idx").on(table.userId),
	}),
);

export const votes = sqliteTable(
	"votes",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").notNull(),
		targetType: text("target_type").notNull(),
		targetId: integer("target_id").notNull(),
		voteType: integer("vote_type").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userTargetIdx: index("vote_user_target_idx").on(
			table.userId,
			table.targetType,
			table.targetId,
		),
	}),
);

export const userAudios = sqliteTable(
	"user_audios",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		compositionId: integer("composition_id").references(
			() => compositions.id,
		),
		ragaId: integer("raga_id").references(() => ragas.id),
		audioUrl: text("audio_url").notNull(),
		duration: integer("duration"),
		isPublic: integer("is_public", { mode: "boolean" }).default(false),
		likes: integer("likes").default(0),
		plays: integer("plays").default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userIdx: index("audio_user_idx").on(table.userId),
		compositionIdx: index("audio_composition_idx").on(table.compositionId),
		publicIdx: index("audio_public_idx").on(table.isPublic),
	}),
);

export const resources = sqliteTable(
	"resources",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		type: text("type").notNull(),
		category: text("category").notNull(),
		difficulty: text("difficulty").notNull(),
		description: text("description"),
		content: text("content"),
		audioUrl: text("audio_url"),
		order: integer("order").default(0),
		views: integer("views").default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		slugIdx: index("resource_slug_idx").on(table.slug),
		categoryIdx: index("resource_category_idx").on(table.category),
		difficultyIdx: index("resource_difficulty_idx").on(table.difficulty),
	}),
);

export const userProgress = sqliteTable(
	"user_progress",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").notNull(),
		resourceId: integer("resource_id")
			.notNull()
			.references(() => resources.id),
		completed: integer("completed", { mode: "boolean" }).default(false),
		completedAt: integer("completed_at", { mode: "timestamp" }),
		notes: text("notes"),
	},
	(table) => ({
		userResourceIdx: index("progress_user_resource_idx").on(
			table.userId,
			table.resourceId,
		),
	}),
);

export const comments = sqliteTable(
	"comments",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		targetType: text("target_type").notNull(),
		targetId: integer("target_id").notNull(),
		body: text("body").notNull(),
		upvotes: integer("upvotes").default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		targetIdx: index("comment_target_idx").on(
			table.targetType,
			table.targetId,
		),
	}),
);

export const annotations = sqliteTable(
	"annotations",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		compositionId: integer("composition_id")
			.notNull()
			.references(() => compositions.id),
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		lineNumber: integer("line_number").notNull(),
		annotation: text("annotation").notNull(),
		upvotes: integer("upvotes").default(0),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		compositionIdx: index("annotation_composition_idx").on(
			table.compositionId,
		),
	}),
);

export const ragasRelations = relations(ragas, ({ many }) => ({
	compositions: many(compositions),
	ratings: many(ragaRatings),
	userAudios: many(userAudios),
}));

export const composersRelations = relations(composers, ({ many }) => ({
	compositions: many(compositions),
}));

export const compositionsRelations = relations(
	compositions,
	({ one, many }) => ({
		composer: one(composers, {
			fields: [compositions.composerId],
			references: [composers.id],
		}),
		raga: one(ragas, {
			fields: [compositions.ragaId],
			references: [ragas.id],
		}),
		annotations: many(annotations),
	}),
);

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
