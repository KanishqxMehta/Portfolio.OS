import { z } from "zod";
import { SectionSchema, HeroContentSchema, ProjectItemSchema, ExperienceItemSchema, EducationItemSchema, TestimonialItemSchema, ContactFormContentSchema, type Section } from "./portfolio";

// Drafts preserve incomplete input; strict publish validation remains unchanged.
const text = z.string().max(50000);
const optionalText = text.optional();
const contentByType = {
  HERO: HeroContentSchema.safeExtend({ fullName: text, resumeUrl: optionalText, phone: optionalText, github: optionalText, linkedin: optionalText, instagram: optionalText, twitter: optionalText }),
  SKILLS: z.object({ items: z.array(text).max(200) }),
  PROJECTS: z.object({ items: z.array(ProjectItemSchema.safeExtend({ title: text, description: text, link: optionalText, sourceUrl: optionalText, year: optionalText, tags: z.array(text).max(20).optional(), screenshots: z.array(z.object({ url: text, thumbnailUrl: optionalText, caption: optionalText })).max(8).optional() })).max(200) }),
  EXPERIENCE: z.object({ items: z.array(ExperienceItemSchema.safeExtend({ company: text, role: text, years: text, description: text })).max(200) }),
  EDUCATION: z.object({ items: z.array(EducationItemSchema.safeExtend({ school: text, degree: text, year: text })).max(200) }),
  TESTIMONIALS: z.object({ items: z.array(TestimonialItemSchema.safeExtend({ quote: text, author: text })).max(200) }),
  CONTACT_FORM: ContactFormContentSchema.safeExtend({ emailTarget: text, buttonText: text }),
};
const section = z.object({ id: z.string().max(200), type: z.enum(["HERO", "SKILLS", "PROJECTS", "EXPERIENCE", "EDUCATION", "TESTIMONIALS", "CONTACT_FORM"]), title: text, isVisible: z.boolean(), content: z.unknown() }).transform((value, ctx) => {
  const parsed = contentByType[value.type].safeParse(value.content);
  if (!parsed.success) {
    ctx.addIssue({ code: "custom", message: "Invalid draft block structure" });
    return z.NEVER;
  }
  // Relaxed fields have the same shapes as SectionSchema, without publish-only rules.
  return { ...value, content: parsed.data } as z.infer<typeof SectionSchema>;
});
export const draftSnapshotSchema = z.object({
  username: z.string().max(20),
  theme: z.string().max(80),
  layout: z.string().max(80),
  sections: z.array(section).max(20),
});
export type DraftSnapshot = { username: string; theme: string; layout: string; sections: Section[] };
export const draftWriteSchema = z.object({ revision: z.number().int().nonnegative(), snapshot: draftSnapshotSchema });
