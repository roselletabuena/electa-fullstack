import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

const globalForS3 = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

export function createS3Client(): S3Client {
  return new S3Client({
    region: env.AWS_REGION,
  });
}

export const s3Client = globalForS3.s3Client ?? createS3Client();

if (env.NODE_ENV !== "production") {
  globalForS3.s3Client = s3Client;
}
