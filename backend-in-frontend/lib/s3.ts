import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.DYNAMODB_REGION || "ap-south-1";
const S3_BUCKET_NAME =
  process.env.S3_BUCKET_NAME || "visitor-management-assets-dev";

// Lazy load S3 client
let s3Client: S3Client | null = null;
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({ region: REGION });
  }
  return s3Client;
}

export async function uploadPhoto(
  visitorId: string,
  photoBuffer: Buffer,
  contentType: string
): Promise<string> {
  // Determine file extension based on MIME type
  let ext = "jpg";
  if (contentType.includes("png")) ext = "png";
  else if (contentType.includes("webp")) ext = "webp";
  else if (contentType.includes("gif")) ext = "gif";

  const key = `photos/${visitorId}.${ext}`;

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: photoBuffer,
      ContentType: contentType,
    });
    await getS3Client().send(command);
    return `https://${S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 uploadPhoto error:", error);
    throw error;
  }
}

export async function uploadGatePass(visitorId: string, pdfBuffer: Buffer): Promise<string> {
  const key = `gatepasses/${visitorId}.pdf`;

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    });
    await getS3Client().send(command);
    return `https://${S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 uploadGatePass error:", error);
    throw error;
  }
}
