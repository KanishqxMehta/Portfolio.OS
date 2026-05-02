import { z } from "zod";

const SectionSchema = z.object({
  id: z.string(),
  type: z.enum(['HERO', 'EXPERIENCE', 'PROJECTS', 'SKILLS']),
  title: z.string(),
  content: z.any(), // We'll refine this with discriminated unions later
  isVisible: z.boolean().default(true),
});

export const portfolioSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9-]+$/, {
      message: "Username can only contain lowercase letters, numbers, and hyphens",
    }),
  content: z.object({
    theme: z.string(),
    sections: z.array(z.any()),
  }),
});