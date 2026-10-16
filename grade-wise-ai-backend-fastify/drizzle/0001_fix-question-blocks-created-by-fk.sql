ALTER TABLE "question_blocks" DROP CONSTRAINT "question_blocks_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "question_blocks" ADD CONSTRAINT "question_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;