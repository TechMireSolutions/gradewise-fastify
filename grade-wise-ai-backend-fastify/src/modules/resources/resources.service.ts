import { db } from "../../db/index.js";
import {
  resources,
  assessmentResources,
  resourceChunks,
  type Resource,
} from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { AppError, NotFoundError, ForbiddenError } from "../../utils/errors.js";
import mammoth from "mammoth";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// pdf-parse ships as CJS; use require to avoid ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require("pdf-parse");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.trim().length > 50);
}

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
    const result = await pdfParse(buffer);
    return result.text;
  }
  if (
    mimeType.includes("word") ||
    mimeType.includes("docx") ||
    mimeType.includes("openxmlformats")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  // Plain text / TXT
  return buffer.toString("utf-8");
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

  // Handle URL resource
  if (url && !files.length) {
    const [resource] = await db
      .insert(resources)
      .values({
        name: name ?? url,
        url,
        contentType: "url",
        visibility,
        uploadedBy: userId,
      })
      .returning();
    if (resource) uploaded.push(resource);
    return { uploaded, skipped };
  }

  // Handle file uploads
  for (const file of files) {
    try {
      const text = await extractText(file.buffer, file.mimetype);
      if (!text || text.trim().length < 20) {
        skipped.push(file.filename);
        continue;
      }

      const [resource] = await db
        .insert(resources)
        .values({
          name: name ?? file.filename,
          fileType: file.mimetype,
          fileSize: file.buffer.length,
          contentType: "file",
          visibility,
          uploadedBy: userId,
        })
        .returning();

      if (!resource) { skipped.push(file.filename); continue; }

      // Store chunks for RAG
      const chunks = chunkText(text);
      if (chunks.length > 0) {
        await db.insert(resourceChunks).values(
          chunks.map((chunk, i) => ({
            resourceId: resource.id,
            chunkText: chunk,
            chunkIndex: i,
          }))
        );
      }

      uploaded.push(resource);
    } catch {
      skipped.push(file.filename);
    }
  }

  return { uploaded, skipped };
}

export async function getInstructorResourcesService(
  userId: number,
  visibility?: string
): Promise<Resource[]> {
  const conditions = [eq(resources.uploadedBy, userId)];
  if (visibility === "private" || visibility === "public") {
    conditions.push(eq(resources.visibility, visibility));
  }
  return db
    .select()
    .from(resources)
    .where(and(...conditions))
    .orderBy(sql`${resources.createdAt} DESC`);
}

export async function getAllResourcesService(): Promise<Resource[]> {
  return db.select().from(resources).orderBy(sql`${resources.createdAt} DESC`);
}

export async function getResourceByIdService(
  resourceId: number,
  userId: number,
  role: string
): Promise<Resource> {
  const result = await db
    .select()
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);

  const resource = result[0];
  if (!resource) throw new NotFoundError("Resource");

  const isOwner = resource.uploadedBy === userId;
  const isAdmin = ["admin", "super_admin"].includes(role);
  if (!isOwner && !isAdmin && resource.visibility === "private") {
    throw new ForbiddenError("Access denied to this resource");
  }

  return resource;
}

export async function updateResourceService(
  resourceId: number,
  userId: number,
  updates: { name?: string; visibility?: "private" | "public" }
): Promise<Resource> {
  const existing = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, resourceId), eq(resources.uploadedBy, userId)))
    .limit(1);

  if (!existing[0]) throw new NotFoundError("Resource");

  const [updated] = await db
    .update(resources)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(resources.id, resourceId))
    .returning();

  if (!updated) throw new NotFoundError("Resource");
  return updated;
}

export async function deleteResourceService(
  resourceId: number,
  userId: number,
  role: string
): Promise<void> {
  const existing = await db
    .select()
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);

  if (!existing[0]) throw new NotFoundError("Resource");
  const isOwner = existing[0].uploadedBy === userId;
  const isAdmin = ["admin", "super_admin"].includes(role);
  if (!isOwner && !isAdmin) throw new ForbiddenError("Access denied");

  await db.delete(resourceChunks).where(eq(resourceChunks.resourceId, resourceId));
  await db.delete(assessmentResources).where(eq(assessmentResources.resourceId, resourceId));
  await db.delete(resources).where(eq(resources.id, resourceId));
}

export async function linkResourceToAssessmentService(
  resourceId: number,
  assessmentId: number
): Promise<void> {
  await db
    .insert(assessmentResources)
    .values({ resourceId, assessmentId })
    .onConflictDoNothing();
}

export async function unlinkResourceFromAssessmentService(
  resourceId: number,
  assessmentId: number
): Promise<void> {
  await db
    .delete(assessmentResources)
    .where(
      and(
        eq(assessmentResources.resourceId, resourceId),
        eq(assessmentResources.assessmentId, assessmentId)
      )
    );
}

export async function getAssessmentResourcesService(assessmentId: number): Promise<Resource[]> {
  return db
    .select({
      id: resources.id,
      name: resources.name,
      url: resources.url,
      fileType: resources.fileType,
      fileSize: resources.fileSize,
      visibility: resources.visibility,
      contentType: resources.contentType,
      uploadedBy: resources.uploadedBy,
      createdAt: resources.createdAt,
      updatedAt: resources.updatedAt,
    })
    .from(assessmentResources)
    .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
    .where(eq(assessmentResources.assessmentId, assessmentId));
}
