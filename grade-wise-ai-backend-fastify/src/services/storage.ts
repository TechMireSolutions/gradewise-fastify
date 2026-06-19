import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env["S3_BUCKET"] ?? "gradewise";

function createClient(): S3Client | null {
  const endpoint = process.env["S3_ENDPOINT"];
  if (!endpoint) return null;

  return new S3Client({
    endpoint,
    region: process.env["S3_REGION"] ?? "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env["S3_ACCESS_KEY"] ?? "minioadmin",
      secretAccessKey: process.env["S3_SECRET_KEY"] ?? "minioadmin",
    },
  });
}

let client: S3Client | null = createClient();

export function isStorageEnabled(): boolean {
  return Boolean(process.env["S3_ENDPOINT"]);
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string | null> {
  if (!client) return null;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return key;
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string | null> {
  if (!client) return null;
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
}
