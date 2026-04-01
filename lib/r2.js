import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

/**
 * Generate a presigned URL for the browser to upload directly to R2.
 * Expires in 10 minutes.
 */
export async function getUploadUrl(key, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, cmd, { expiresIn: 600 });
}

/**
 * Generate a presigned URL for downloading a file.
 * Expires in 1 hour.
 */
export async function getDownloadUrl(key, filename) {
  const cmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  });
  return getSignedUrl(r2, cmd, { expiresIn: 3600 });
}

/**
 * Delete a file from R2.
 */
export async function deleteFile(key) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
