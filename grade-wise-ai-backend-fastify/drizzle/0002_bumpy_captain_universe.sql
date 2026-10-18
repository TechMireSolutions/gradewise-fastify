ALTER TYPE "public"."question_type" ADD VALUE 'fill_in_the_blank';--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;