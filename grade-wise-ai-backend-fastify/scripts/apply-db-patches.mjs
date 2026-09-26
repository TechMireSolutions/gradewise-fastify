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
    name: "0004_ensure-super-admin-user",
    run: async () => {
      await sql`
        UPDATE users
        SET role = 'super_admin'::role, verified = true
        WHERE LOWER(TRIM(email)) = 'superadmin@gmail.com'
      `;
      const existing = await sql`
        SELECT id FROM users WHERE LOWER(TRIM(email)) = 'superadmin@gmail.com' LIMIT 1
      `;
      if (existing.length === 0) {
        const bcrypt = (await import("bcryptjs")).default;
        const hashed = await bcrypt.hash("superadmin123", 12);
        await sql`
          INSERT INTO users (name, email, password, role, verified, provider, created_at, updated_at)
          VALUES ('Super Admin', 'superadmin@gmail.com', ${hashed}, 'super_admin'::role, true, 'manual'::auth_provider, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE SET role = 'super_admin'::role, verified = true
        `;
      }
    },
  },
  {
    name: "0003_add-fill-in-the-blank-type",
    run: () => sql`ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'fill_in_the_blank'`,
  },
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
