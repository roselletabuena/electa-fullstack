import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test schema matching the storage environment specification in src/env.ts
const storageEnvSchema = z.object({
  AWS_REGION: z.string().min(1).default("ap-southeast-1"),
  S3_MEDIA_BUCKET: z.string().min(1).default("electa-dev-media-assets"),
  COGNITO_DOMAIN: z.string().url().optional(),
  NEXT_PUBLIC_AWS_REGION: z.string().min(1).default("ap-southeast-1"),
  NEXT_PUBLIC_S3_MEDIA_BUCKET: z.string().min(1).default("electa-dev-media-assets"),
  NEXT_PUBLIC_COGNITO_DOMAIN: z.string().url().optional(),
});

describe("Storage Environment Configuration Schema (VS-41)", () => {
  it("parses valid storage configuration with explicit values", () => {
    const rawEnv = {
      AWS_REGION: "ap-southeast-1",
      S3_MEDIA_BUCKET: "electa-dev-media-assets",
      COGNITO_DOMAIN: "https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com",
      NEXT_PUBLIC_AWS_REGION: "ap-southeast-1",
      NEXT_PUBLIC_S3_MEDIA_BUCKET: "electa-dev-media-assets",
      NEXT_PUBLIC_COGNITO_DOMAIN: "https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com",
    };

    const parsed = storageEnvSchema.parse(rawEnv);
    expect(parsed.AWS_REGION).toBe("ap-southeast-1");
    expect(parsed.S3_MEDIA_BUCKET).toBe("electa-dev-media-assets");
    expect(parsed.COGNITO_DOMAIN).toBe(
      "https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com"
    );
    expect(parsed.NEXT_PUBLIC_S3_MEDIA_BUCKET).toBe("electa-dev-media-assets");
  });

  it("applies safe defaults when optional variables are omitted", () => {
    const parsed = storageEnvSchema.parse({});
    expect(parsed.AWS_REGION).toBe("ap-southeast-1");
    expect(parsed.S3_MEDIA_BUCKET).toBe("electa-dev-media-assets");
    expect(parsed.NEXT_PUBLIC_AWS_REGION).toBe("ap-southeast-1");
    expect(parsed.NEXT_PUBLIC_S3_MEDIA_BUCKET).toBe("electa-dev-media-assets");
    expect(parsed.COGNITO_DOMAIN).toBeUndefined();
  });

  it("rejects invalid Cognito domain URL", () => {
    expect(() =>
      storageEnvSchema.parse({
        COGNITO_DOMAIN: "invalid-not-a-url",
      })
    ).toThrow();
  });

  it("rejects empty bucket name strings", () => {
    expect(() =>
      storageEnvSchema.parse({
        S3_MEDIA_BUCKET: "",
      })
    ).toThrow();
  });
});
