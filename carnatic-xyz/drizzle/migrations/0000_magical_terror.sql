CREATE TABLE `annotations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`composition_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`line_number` integer NOT NULL,
	`annotation` text NOT NULL,
	`upvotes` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`composition_id`) REFERENCES `compositions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `annotation_composition_idx` ON `annotations` (`composition_id`);--> statement-breakpoint
CREATE TABLE `answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`body` text NOT NULL,
	`upvotes` integer DEFAULT 0,
	`is_accepted` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `answer_question_idx` ON `answers` (`question_id`);--> statement-breakpoint
CREATE INDEX `answer_user_idx` ON `answers` (`user_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`body` text NOT NULL,
	`upvotes` integer DEFAULT 0,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comment_target_idx` ON `comments` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `composers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`period` text,
	`biography` text,
	`notable_works` text,
	`image_url` text,
	`birth_place` text,
	`language` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `composers_name_unique` ON `composers` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `composers_slug_unique` ON `composers` (`slug`);--> statement-breakpoint
CREATE INDEX `composer_name_idx` ON `composers` (`name`);--> statement-breakpoint
CREATE INDEX `composer_slug_idx` ON `composers` (`slug`);--> statement-breakpoint
CREATE TABLE `compositions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`composer_id` integer NOT NULL,
	`raga_id` integer,
	`tala` text,
	`type` text NOT NULL,
	`language` text NOT NULL,
	`lyrics_original` text NOT NULL,
	`lyrics_transliterated` text,
	`lyrics_translated` text,
	`meaning` text,
	`notation` text,
	`audio_url` text,
	`difficulty` text,
	`duration` integer,
	`tempo` text,
	`views` integer DEFAULT 0,
	`likes` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`composer_id`) REFERENCES `composers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`raga_id`) REFERENCES `ragas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compositions_slug_unique` ON `compositions` (`slug`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `compositions` (`title`);--> statement-breakpoint
CREATE INDEX `comp_slug_idx` ON `compositions` (`slug`);--> statement-breakpoint
CREATE INDEX `comp_raga_idx` ON `compositions` (`raga_id`);--> statement-breakpoint
CREATE INDEX `comp_composer_idx` ON `compositions` (`composer_id`);--> statement-breakpoint
CREATE INDEX `comp_type_idx` ON `compositions` (`type`);--> statement-breakpoint
CREATE INDEX `comp_difficulty_idx` ON `compositions` (`difficulty`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`body` text NOT NULL,
	`tags` text,
	`views` integer DEFAULT 0,
	`upvotes` integer DEFAULT 0,
	`answer_count` integer DEFAULT 0,
	`accepted_answer_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `questions_slug_unique` ON `questions` (`slug`);--> statement-breakpoint
CREATE INDEX `question_slug_idx` ON `questions` (`slug`);--> statement-breakpoint
CREATE INDEX `question_user_idx` ON `questions` (`user_id`);--> statement-breakpoint
CREATE INDEX `question_tags_idx` ON `questions` (`tags`);--> statement-breakpoint
CREATE TABLE `raga_ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`raga_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`review` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`raga_id`) REFERENCES `ragas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_raga_idx` ON `raga_ratings` (`user_id`,`raga_id`);--> statement-breakpoint
CREATE INDEX `rating_raga_idx` ON `raga_ratings` (`raga_id`);--> statement-breakpoint
CREATE TABLE `ragas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`melakarta` text,
	`arohanam` text NOT NULL,
	`avarohanam` text NOT NULL,
	`type` text NOT NULL,
	`prahar` text,
	`rasa` text,
	`description` text,
	`characteristic_phrases` text,
	`average_rating` real DEFAULT 0,
	`total_ratings` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ragas_name_unique` ON `ragas` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `ragas_slug_unique` ON `ragas` (`slug`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `ragas` (`name`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `ragas` (`slug`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `ragas` (`type`);--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`difficulty` text NOT NULL,
	`description` text,
	`content` text,
	`audio_url` text,
	`order` integer DEFAULT 0,
	`views` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resources_slug_unique` ON `resources` (`slug`);--> statement-breakpoint
CREATE INDEX `resource_slug_idx` ON `resources` (`slug`);--> statement-breakpoint
CREATE INDEX `resource_category_idx` ON `resources` (`category`);--> statement-breakpoint
CREATE INDEX `resource_difficulty_idx` ON `resources` (`difficulty`);--> statement-breakpoint
CREATE TABLE `user_audios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`composition_id` integer,
	`raga_id` integer,
	`audio_url` text NOT NULL,
	`duration` integer,
	`is_public` integer DEFAULT false,
	`likes` integer DEFAULT 0,
	`plays` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`composition_id`) REFERENCES `compositions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`raga_id`) REFERENCES `ragas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audio_user_idx` ON `user_audios` (`user_id`);--> statement-breakpoint
CREATE INDEX `audio_composition_idx` ON `user_audios` (`composition_id`);--> statement-breakpoint
CREATE INDEX `audio_public_idx` ON `user_audios` (`is_public`);--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`resource_id` integer NOT NULL,
	`completed` integer DEFAULT false,
	`completed_at` integer,
	`notes` text,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `progress_user_resource_idx` ON `user_progress` (`user_id`,`resource_id`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`vote_type` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vote_user_target_idx` ON `votes` (`user_id`,`target_type`,`target_id`);