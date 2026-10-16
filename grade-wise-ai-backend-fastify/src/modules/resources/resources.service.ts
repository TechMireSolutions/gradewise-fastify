import { db, resources } from "../../db/index.js";
import { eq, or, sql } from "drizzle-orm";
import type { Resource } from "../../db/schema.js";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";

export async function getResourcesService(userId: number): Promise<Resource[]> {
  return db
    .select()
    .from(resources)
    .where(or(eq(resources.uploadedBy, userId), eq(resources.visibility, "public")))
    .orderBy(sql`${resources.createdAt} DESC`);
}

async function extractTextFromFile(file: {
  buffer: Buffer;
  filename: string;
  mimetype: string;
}): Promise<string> {
  const mimetype = file.mimetype ?? "";
  const ext = (file.filename ?? "").split(".").pop()?.toLowerCase() ?? "";

  try {
    if (mimetype === "application/pdf" || ext === "pdf") {
      const parser = new PDFParse({ data: file.buffer });
      try {
        const result = await parser.getText();
        return result.text.trim().slice(0, 20_000);
      } finally {
        await parser.destroy().catch(() => {});
      }
    }

    if (
      mimetype.includes("text/") ||
      ["txt", "md", "csv", "json"].includes(ext)
    ) {
      return file.buffer.toString("utf8").replace(/\u0000/g, "").trim();
    }

    if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return (result.value ?? "").trim();
    }
  } catch (err) {
    console.warn(`[Resources] Failed to extract text from ${file.filename}:`, err);
  }

  return "";
}

export async function uploadResourceService(
  files: Array<{ buffer: Buffer; filename: string; mimetype: string }>,
  userId: number,
  name?: string,
  url?: string,
  visibility: "private" | "public" = "private"
): Promise<{ uploaded: Resource[]; skipped: string[] }> {
  const uploaded: Resource[] = [];
  const skipped: string[] = [];

  if (url && files.length === 0) {
    const [inserted] = await db.insert(resources).values({
      name: name || url,
      url,
      contentType: "url",
      visibility: visibility || "private",
      uploadedBy: userId,
    }).returning();

    if (inserted) {
      uploaded.push(inserted);
      await db.execute(sql`
        INSERT INTO resource_chunks (resource_id, chunk_text, chunk_index)
        VALUES (${inserted.id}, ${url}, 0)
      `);
    }
    return { uploaded, skipped };
  }

  for (const file of files) {
    const extractedText = await extractTextFromFile(file);
    if (!extractedText) {
      skipped.push(file.filename ?? "unnamed file");
      continue;
    }

    const [inserted] = await db.insert(resources).values({
      name: name || file.filename,
      fileType: file.mimetype,
      fileSize: file.buffer.length,
      visibility: visibility || "private",
      uploadedBy: userId,
    }).returning();

    if (inserted) {
      uploaded.push(inserted);
      await db.execute(sql`
        INSERT INTO resource_chunks (resource_id, chunk_text, chunk_index)
        VALUES (${inserted.id}, ${extractedText}, 0)
      `);
    }
  }
  return { uploaded, skipped };
}

export async function deleteResourceService(
  id: number,
  userId: number,
  role: string
): Promise<void> {
  const [existing] = await db
    .select({ id: resources.id, uploadedBy: resources.uploadedBy })
    .from(resources)
    .where(eq(resources.id, id))
    .limit(1);

  if (!existing) throw new NotFoundError("Resource");
  if (!["admin", "super_admin"].includes(role) && existing.uploadedBy !== userId) {
    throw new ForbiddenError("Access denied to this resource");
  }

  await db.execute(sql`DELETE FROM resource_chunks WHERE resource_id = ${id}`);
  await db.delete(resources).where(eq(resources.id, id));
}
