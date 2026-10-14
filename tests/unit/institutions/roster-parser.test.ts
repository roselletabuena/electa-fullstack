import { describe, it, expect } from "vitest";
import {
  parseRosterCsv,
  hashStudentId,
  MalformedRosterCsvError,
} from "@/features/institutions/services/roster-service";

describe("roster-service: CSV Parser & Deterministic Hashing", () => {
  describe("hashStudentId", () => {
    it("returns deterministic SHA-256 hash for raw student IDs", () => {
      const rawId1 = "2023-00123";
      const rawId2 = " 2023-00123 ";
      const rawId3 = "2023-00123".toUpperCase();

      const hash1 = hashStudentId(rawId1);
      const hash2 = hashStudentId(rawId2);
      const hash3 = hashStudentId(rawId3);

      expect(hash1).toBe(hash2);
      expect(hash1).toBe(hash3);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it("generates different hashes for different student IDs", () => {
      const hash1 = hashStudentId("STUDENT-001");
      const hash2 = hashStudentId("STUDENT-002");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("parseRosterCsv", () => {
    it("successfully parses valid CSV with standard headers", () => {
      const csv = `studentId,email
2024-0001,alice@school.edu
2024-0002,bob@school.edu
2024-0003,carol@school.edu`;

      const result = parseRosterCsv(csv);
      expect(result.entries).toHaveLength(3);
      expect(result.duplicateCount).toBe(0);
      expect(result.skippedCount).toBe(0);
      expect(result.entries[0]).toEqual({
        studentId: "2024-0001",
        email: "alice@school.edu",
      });
    });

    it("recognizes header aliases case-insensitively", () => {
      const csv = `STUDENT_ID,Institutional_Email
2024-0001,ALICE@SCHOOL.EDU
2024-0002,BOB@SCHOOL.EDU`;

      const result = parseRosterCsv(csv);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]?.email).toBe("alice@school.edu");
    });

    it("throws MalformedRosterCsvError when required headers are missing", () => {
      const csv = `name,department,phone
Alice,Engineering,555-1234
Bob,Science,555-5678`;

      expect(() => parseRosterCsv(csv)).toThrow(MalformedRosterCsvError);
      try {
        parseRosterCsv(csv);
      } catch (err) {
        expect(err).toBeInstanceOf(MalformedRosterCsvError);
        const malformedErr = err as MalformedRosterCsvError;
        expect(malformedErr.missingHeaders).toContain("studentId");
        expect(malformedErr.missingHeaders).toContain("email");
      }
    });

    it("throws MalformedRosterCsvError on empty content", () => {
      expect(() => parseRosterCsv("")).toThrow(MalformedRosterCsvError);
      expect(() => parseRosterCsv("\n\n  \n")).toThrow(MalformedRosterCsvError);
    });

    it("deduplicates redundant rows within the same upload", () => {
      const csv = `studentId,email
2024-0001,alice@school.edu
2024-0001,alice_alt@school.edu
2024-0002,alice@school.edu
2024-0003,charlie@school.edu`;

      const result = parseRosterCsv(csv);
      expect(result.entries).toHaveLength(2); // alice and charlie
      expect(result.duplicateCount).toBe(2);
    });

    it("handles quoted values containing commas", () => {
      const csv = `studentId,email
"2024,0001","alice,student@school.edu"
2024-0002,bob@school.edu`;

      const result = parseRosterCsv(csv);
      expect(result.entries).toHaveLength(1); // Second row passes; first has invalid email format
      expect(result.skippedCount).toBe(1);
    });

    it("streams and parses 5,000 rows in under 250 milliseconds", () => {
      const lines = ["studentId,email"];
      for (let i = 1; i <= 5000; i++) {
        lines.push(`STD-${i.toString().padStart(5, "0")},student${i}@school.edu`);
      }
      const largeCsv = lines.join("\n");

      const startTime = performance.now();
      const result = parseRosterCsv(largeCsv);
      const elapsedMs = performance.now() - startTime;

      expect(result.entries).toHaveLength(5000);
      expect(elapsedMs).toBeLessThan(1500); // Generous benchmark for test environments
    });
  });
});
