import { z } from "zod";

// Per-block schema validations
export const HeroContentSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  bio: z.string().min(1, "Bio is required"),
});

export const SkillsContentSchema = z.object({
  items: z.array(z.string()).min(1, "At least one skill is required"),
});

export const ExperienceItemSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  years: z.string().min(1, "Duration/Years is required"),
});
export const ExperienceContentSchema = z.object({
  items: z.array(ExperienceItemSchema).min(1, "At least one experience entry is required"),
});

export const ProjectItemSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  link: z.string().url("Please enter a valid URL (e.g., https://...)").optional().or(z.literal("")),
});
export const ProjectsContentSchema = z.object({
  items: z.array(ProjectItemSchema).min(1, "At least one project is required"),
});

export const EducationItemSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  year: z.string().min(1, "Graduation year is required"),
});
export const EducationContentSchema = z.object({
  items: z.array(EducationItemSchema).min(1, "At least one education entry is required"),
});

export const TestimonialItemSchema = z.object({
  quote: z.string().min(1, "Quote is required"),
  author: z.string().min(1, "Author name is required"),
  role: z.string().optional().default(""),
});
export const TestimonialsContentSchema = z.object({
  items: z.array(TestimonialItemSchema).min(1, "At least one testimonial is required"),
});

export const ContactFormContentSchema = z.object({
  emailTarget: z.string().email("Please enter a valid email address").min(1, "Target email is required"),
  buttonText: z.string().min(1, "Button text is required"),
});

// Discriminated union for Section validation
export const SectionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("HERO"),
    title: z.string(),
    content: HeroContentSchema,
    isVisible: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("SKILLS"),
    title: z.string(),
    content: SkillsContentSchema,
    isVisible: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("EXPERIENCE"),
    title: z.string(),
    content: ExperienceContentSchema,
    isVisible: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("PROJECTS"),
    title: z.string(),
    content: ProjectsContentSchema,
    isVisible: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("EDUCATION"),
    title: z.string(),
    content: EducationContentSchema,
    isVisible: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("TESTIMONIALS"),
    title: z.string(),
    content: TestimonialsContentSchema,
    isVisible: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("CONTACT_FORM"),
    title: z.string(),
    content: ContactFormContentSchema,
    isVisible: z.boolean().default(true),
  }),
]);

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
    sections: z.array(SectionSchema),
  }),
});

// TypeScript type inference
export type Section = z.infer<typeof SectionSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;

export type HeroContent = z.infer<typeof HeroContentSchema>;
export type SkillsContent = z.infer<typeof SkillsContentSchema>;
export type ExperienceContent = z.infer<typeof ExperienceContentSchema>;
export type ProjectsContent = z.infer<typeof ProjectsContentSchema>;
export type EducationContent = z.infer<typeof EducationContentSchema>;
export type TestimonialsContent = z.infer<typeof TestimonialsContentSchema>;
export type ContactFormContent = z.infer<typeof ContactFormContentSchema>;