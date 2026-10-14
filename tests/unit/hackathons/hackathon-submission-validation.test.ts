import { describe, expect, it } from "vitest";
import {
  createProjectSubmissionSchema,
  gitRepositoryUrlRegex,
  videoUrlRegex,
  figmaUrlRegex,
} from "@/lib/validations/hackathon-submission";

describe("hackathon-submission validation schemas", () => {
  describe("gitRepositoryUrlRegex", () => {
    it("should accept valid GitHub repository URLs", () => {
      expect(gitRepositoryUrlRegex.test("https://github.com/facebook/react")).toBe(true);
      expect(gitRepositoryUrlRegex.test("https://www.github.com/vercel/next.js")).toBe(true);
      expect(gitRepositoryUrlRegex.test("https://github.com/my-org/my-project/")).toBe(true);
    });

    it("should accept valid GitLab repository URLs", () => {
      expect(gitRepositoryUrlRegex.test("https://gitlab.com/gitlab-org/gitlab")).toBe(true);
      expect(gitRepositoryUrlRegex.test("https://www.gitlab.com/group/subgroup/project")).toBe(true);
    });

    it("should reject invalid repository URLs", () => {
      expect(gitRepositoryUrlRegex.test("ftp://github.com/user/repo")).toBe(false);
      expect(gitRepositoryUrlRegex.test("http://github.com/user/repo")).toBe(false);
      expect(gitRepositoryUrlRegex.test("https://bitbucket.org/user/repo")).toBe(false);
      expect(gitRepositoryUrlRegex.test("https://notgit.com/user/repo")).toBe(false);
      expect(gitRepositoryUrlRegex.test("plain-text")).toBe(false);
      expect(gitRepositoryUrlRegex.test("https://github.com/justonepart")).toBe(false);
    });
  });

  describe("videoUrlRegex & figmaUrlRegex", () => {
    it("should validate YouTube and Loom URLs", () => {
      expect(videoUrlRegex.test("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
      expect(videoUrlRegex.test("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
      expect(videoUrlRegex.test("https://www.loom.com/share/abc123xyz")).toBe(true);
      expect(videoUrlRegex.test("https://vimeo.com/12345")).toBe(false);
    });

    it("should validate Figma URLs", () => {
      expect(figmaUrlRegex.test("https://www.figma.com/design/xyz123/Project-Mock")).toBe(true);
      expect(figmaUrlRegex.test("https://figma.com/file/abc456/UI-Design")).toBe(true);
      expect(figmaUrlRegex.test("https://sketch.com/file/123")).toBe(false);
    });
  });

  describe("createProjectSubmissionSchema", () => {
    const validPayload = {
      title: "QuantumVote AI",
      tagline: "AI-driven voter verification and fraud detection",
      description: "A comprehensive hackathon project submission for the AI & Security track.",
      repositoryUrl: "https://github.com/the-devsketeers/quantum-vote",
      demoUrl: "https://quantum-vote.vercel.app",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      trackTags: ["AI & Machine Learning", "Open Innovation"],
      members: [
        { name: "Alice Dev", email: "alice@example.com", role: "Team Lead" },
        { name: "Bob Coder", email: "bob@example.com", role: "Backend Developer" },
      ],
      links: [
        { label: "Figma Prototype", url: "https://www.figma.com/design/example/ui" },
      ],
    };

    it("should validate a completely valid submission payload", () => {
      const result = createProjectSubmissionSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("QuantumVote AI");
        expect(result.data.trackTags).toHaveLength(2);
        expect(result.data.members).toHaveLength(2);
      }
    });

    it("should reject when repositoryUrl is not GitHub or GitLab", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        repositoryUrl: "ftp://example.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some((i) => i.message.includes("Must be a valid GitHub or GitLab repository URL."))).toBe(true);
      }
    });

    it("should reject when title is shorter than 3 characters", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        title: "Hi",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 3 characters");
      }
    });

    it("should reject when description is shorter than 10 characters", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        description: "Too short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 10 characters");
      }
    });

    it("should reject when trackTags is empty", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        trackTags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("At least one track tag is required");
      }
    });

    it("should reject duplicate track tags", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        trackTags: ["AI & ML", "ai & ml"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Duplicate track tags are not allowed");
      }
    });

    it("should reject invalid member email addresses", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        members: [{ name: "Charlie", email: "not-an-email", role: "Contributor" }],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Invalid member email address");
      }
    });

    it("should reject non-HTTPS custom links", () => {
      const result = createProjectSubmissionSchema.safeParse({
        ...validPayload,
        links: [{ label: "Unsecure Link", url: "http://insecure.example.com" }],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Link URL must use HTTPS protocol");
      }
    });
  });
});
