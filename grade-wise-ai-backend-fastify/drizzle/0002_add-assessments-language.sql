-- Add language column to assessments (defaults existing rows to English)
ALTER TABLE "assessments" ADD COLUMN "language" text NOT NULL DEFAULT 'en';
