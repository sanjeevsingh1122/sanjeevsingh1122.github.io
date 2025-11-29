import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

const bucket = process.env.BUCKET_NAME || 'turbo-notes-dev';
const s3 = new S3Client({
  region: process.env.BUCKET_REGION || 'us-east-1',
  endpoint: process.env.BUCKET_ENDPOINT,
  forcePathStyle: Boolean(process.env.BUCKET_ENDPOINT),
  credentials: process.env.BUCKET_ACCESS_KEY
    ? {
        accessKeyId: process.env.BUCKET_ACCESS_KEY as string,
        secretAccessKey: process.env.BUCKET_SECRET_KEY as string,
      }
    : undefined,
});

export type UploadResult = {
  key: string;
  url: string;
};

export async function uploadBuffer(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
  const key = `${randomUUID()}-${filename}`;
  const body = Readable.from(buffer);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const url = process.env.PUBLIC_BUCKET_URL ? `${process.env.PUBLIC_BUCKET_URL}/${key}` : `https://${bucket}.s3.amazonaws.com/${key}`;
  return { key, url };
}
