CREATE TABLE "spread_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"spread_id" integer NOT NULL,
	"position_index" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spreads" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"lang" text DEFAULT 'en' NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"detail" text,
	"difficulty" text,
	"recommended" boolean DEFAULT false,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "slug_lang_unique" UNIQUE("slug","lang")
);
--> statement-breakpoint
ALTER TABLE "spread_positions" ADD CONSTRAINT "spread_positions_spread_id_spreads_id_fk" FOREIGN KEY ("spread_id") REFERENCES "public"."spreads"("id") ON DELETE cascade ON UPDATE no action;