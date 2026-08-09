CREATE TABLE "ai_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'openai' NOT NULL,
	"model" text DEFAULT 'gpt-4o' NOT NULL,
	"api_key_encrypted" text,
	"temperature" real DEFAULT 0.7 NOT NULL,
	"language" text DEFAULT 'es' NOT NULL,
	"max_tokens" integer DEFAULT 2048 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"decision" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"what_client_needs" text DEFAULT '' NOT NULL,
	"required_technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"matching_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"missing_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" integer DEFAULT 5 NOT NULL,
	"estimated_time" text DEFAULT '' NOT NULL,
	"recommended_portfolio_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"risks" text DEFAULT '' NOT NULL,
	"worth_applying" boolean DEFAULT true NOT NULL,
	"suggested_min_price" real,
	"suggested_recommended_price" real,
	"suggested_max_price" real,
	"questions_for_client" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"platform" text NOT NULL,
	"budget" real,
	"currency" text DEFAULT 'USD' NOT NULL,
	"client_name" text,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estimated_hours" integer,
	"duration" text,
	"status" text DEFAULT 'nueva' NOT NULL,
	"compatibility_score" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"github" text,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"relevance_level" integer DEFAULT 5 NOT NULL,
	"problem_solved" text DEFAULT '' NOT NULL,
	"date" text NOT NULL,
	"status" text DEFAULT 'activo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"short_version" text NOT NULL,
	"full_version" text NOT NULL,
	"language" text DEFAULT 'es' NOT NULL,
	"tone" text DEFAULT 'profesional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scoring_weights" (
	"id" serial PRIMARY KEY NOT NULL,
	"technologies" integer DEFAULT 30 NOT NULL,
	"experience" integer DEFAULT 20 NOT NULL,
	"budget" integer DEFAULT 15 NOT NULL,
	"time" integer DEFAULT 10 NOT NULL,
	"difficulty" integer DEFAULT 10 NOT NULL,
	"portfolio" integer DEFAULT 10 NOT NULL,
	"language" integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"excluded_technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min_budget" real,
	"max_budget" real,
	"currency" text DEFAULT 'USD' NOT NULL,
	"max_hours" integer,
	"max_duration" text,
	"experience_level" text,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"language" text,
	"project_type" text,
	"remote_only" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text DEFAULT '2bleA' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"experience" text DEFAULT '' NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"availability" text DEFAULT '' NOT NULL,
	"hours_per_week" integer DEFAULT 40 NOT NULL,
	"preferred_job_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"avoided_job_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
