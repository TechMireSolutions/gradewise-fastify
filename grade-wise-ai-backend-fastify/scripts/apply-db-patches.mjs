import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return process.env.DATABASE_URL ?? "";
  const env = fs.readFileSync(envPath, "utf8");
  const match = env.match(/^DATABASE_URL=(.*)$/m);
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : (process.env.DATABASE_URL ?? "");
}

const url = loadEnv();
if (!url) {
  console.error("[db-patch] DATABASE_URL not found");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

const patches = [
  {
    name: "0002_add-assessments-language",
    run: () =>
      sql`ALTER TABLE assessments ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en'`,
  },
  {
    name: "0001_fix-question-blocks-created-by-fk",
    run: () => sql`
      DO $$
      DECLARE
        del_action "char";
      BEGIN
        SELECT confdeltype INTO del_action
        FROM pg_constraint
        WHERE conname = 'question_blocks_created_by_users_id_fk';

        IF del_action IS NOT NULL AND del_action <> 's' THEN
          ALTER TABLE question_blocks DROP CONSTRAINT question_blocks_created_by_users_id_fk;
          ALTER TABLE question_blocks
            ADD CONSTRAINT question_blocks_created_by_users_id_fk
            FOREIGN KEY (created_by) REFERENCES public.users(id)
            ON DELETE set null ON UPDATE no action;
        END IF;
      END $$;
    `,
  },
];

try {
  await sql`SELECT 1`;
  for (const patch of patches) {
    await patch.run();
    console.log(`[db-patch] applied: ${patch.name}`);
  }
  const verify = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'language'
  `;
  console.log(`[db-patch] verify language column: ${verify.length > 0 ? "OK" : "MISSING"}`);
  console.log("[db-patch] all patches applied successfully");
} catch (e) {
  console.error(`[db-patch] FAIL: ${e.message}`);
  process.exit(1);
} finally {
  await sql.end();
}
