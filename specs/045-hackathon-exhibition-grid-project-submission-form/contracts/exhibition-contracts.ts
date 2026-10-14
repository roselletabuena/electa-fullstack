import { z } from "zod";
import {
  createProjectSubmissionSchema,
  type CreateProjectSubmissionInput,
} from "@/lib/validations/hackathon-submission";
import type { ProjectSubmissionDto } from "@/features/hackathons/types/submission";

export { createProjectSubmissionSchema };
export type { CreateProjectSubmissionInput };

export interface SubmitProjectActionResult {
  success: boolean;
  data?: ProjectSubmissionDto;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface ExhibitionFilterState {
  track?: string | null;
  search?: string;
}
