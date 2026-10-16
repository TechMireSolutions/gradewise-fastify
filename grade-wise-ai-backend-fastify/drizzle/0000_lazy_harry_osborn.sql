CREATE TYPE "public"."attempt_status" AS ENUM('pending', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('manual', 'google');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'short_answer', 'true_false', 'matching');--> statement-breakpoint
CREATE TYPE "public"."resource_content_type" AS ENUM('file', 'url');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin', 'instructor', 'student');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"score" numeric(8, 2),
	"status" "attempt_status" DEFAULT 'pending' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"resource_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"prompt" text,
	"external_links" jsonb,
	"instructor_id" integer NOT NULL,
	"is_executed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_order" integer NOT NULL,
	"question_type" "question_type" NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"positive_marks" numeric(5, 2) DEFAULT '1' NOT NULL,
	"negative_marks" numeric(5, 2) DEFAULT '0.25' NOT NULL,
	"duration_per_question" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"question_type" "question_type" NOT NULL,
	"question_count" integer DEFAULT 5 NOT NULL,
	"duration_per_question" integer DEFAULT 60 NOT NULL,
	"num_options" integer DEFAULT 4,
	"left_count" integer DEFAULT 3,
	"right_count" integer DEFAULT 4,
	"positive_marks" numeric(5, 2) DEFAULT '1' NOT NULL,
	"negative_marks" numeric(5, 2) DEFAULT '0.25' NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"file_type" text,
	"file_size" integer,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"content_type" "resource_content_type" DEFAULT 'file' NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"student_answer" text,
	"is_correct" boolean,
	"score" numeric(5, 2),
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_key" text NOT NULL,
	"config_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" "role" DEFAULT 'student' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"provider" "auth_provider" DEFAULT 'manual' NOT NULL,
	"uid" text,
	"reset_token" text,
	"reset_token_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_resources" ADD CONSTRAINT "assessment_resources_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_resources" ADD CONSTRAINT "assessment_resources_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_questions" ADD CONSTRAINT "generated_questions_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_blocks" ADD CONSTRAINT "question_blocks_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_blocks" ADD CONSTRAINT "question_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_chunks" ADD CONSTRAINT "resource_chunks_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_generated_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."generated_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_assessment_idx" ON "assessment_attempts" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "attempts_student_idx" ON "assessment_attempts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "attempts_status_idx" ON "assessment_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "attempts_student_status_idx" ON "assessment_attempts" USING btree ("student_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_resources_unique_idx" ON "assessment_resources" USING btree ("assessment_id","resource_id");--> statement-breakpoint
CREATE INDEX "assessments_instructor_idx" ON "assessments" USING btree ("instructor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_unique_idx" ON "enrollments" USING btree ("assessment_id","student_id");--> statement-breakpoint
CREATE INDEX "enrollments_student_idx" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "gen_questions_attempt_idx" ON "generated_questions" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "gen_questions_order_idx" ON "generated_questions" USING btree ("attempt_id","question_order");--> statement-breakpoint
CREATE INDEX "question_blocks_assessment_idx" ON "question_blocks" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "resource_chunks_resource_idx" ON "resource_chunks" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resources_uploaded_by_idx" ON "resources" USING btree ("uploaded_by");--> statement-breakpoint
CREATE UNIQUE INDEX "student_answers_attempt_question_idx" ON "student_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "student_answers_attempt_idx" ON "student_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "student_answers_question_idx" ON "student_answers" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "system_configs_key_idx" ON "system_configs" USING btree ("config_key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_uid_idx" ON "users" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_verification_token_idx" ON "users" USING btree ("verification_token");--> statement-breakpoint
CREATE INDEX "users_reset_token_idx" ON "users" USING btree ("reset_token");