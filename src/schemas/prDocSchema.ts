import { z } from "zod";

export const generatePrRequestPromptSchema = z.object({
  branchName: z.string(),
  baseBranch: z.string(),
  templateType: z.string(),
  includeDiff: z.boolean(),
  customSections: z.record(z.string(), z.boolean()),
});
