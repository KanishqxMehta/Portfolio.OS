"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { Section } from "@/lib/validations/portfolio";
import { HeroBlockEditor } from "@/components/editor/blocks/HeroBlockEditor";
import { SkillsBlockEditor } from "@/components/editor/blocks/SkillsBlockEditor";
import { ExperienceBlockEditor } from "@/components/editor/blocks/ExperienceBlockEditor";
import { ProjectsBlockEditor } from "@/components/editor/blocks/ProjectsBlockEditor";
import { EducationBlockEditor } from "@/components/editor/blocks/EducationBlockEditor";
import { ContactFormBlockEditor } from "@/components/editor/blocks/ContactFormBlockEditor";
import { TestimonialsBlockEditor } from "@/components/editor/blocks/TestimonialsBlockEditor";

const isValidUrl = (url: string) => {
  if (!url) return true;
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return false;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (email: string) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const fieldClass =
  "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/60 h-9 text-sm rounded-lg transition-colors";

const labelClass =
  "text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500";

export const BlockEditor = ({ block }: { block: Section }) => {
  const updateBlockData = usePortfolioStore((state) => state.updateBlockData);

  const handleUpdate = (newData: any) => {
    updateBlockData!(block.id, newData);
  };

  switch (block.type) {
    case "HERO":
      return (
        <HeroBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          labelClass={labelClass}
          fieldClass={fieldClass}
          isValidUrl={isValidUrl}
        />
      );

    case "SKILLS":
      return (
        <SkillsBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          labelClass={labelClass}
          fieldClass={fieldClass}
        />
      );

    case "EXPERIENCE":
      return (
        <ExperienceBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          labelClass={labelClass}
          fieldClass={fieldClass}
        />
      );

    case "PROJECTS":
      return (
        <ProjectsBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          fieldClass={fieldClass}
          isValidUrl={isValidUrl}
        />
      );

    case "EDUCATION":
      return (
        <EducationBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          fieldClass={fieldClass}
        />
      );

    case "CONTACT_FORM":
      return (
        <ContactFormBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          labelClass={labelClass}
          fieldClass={fieldClass}
          isValidEmail={isValidEmail}
        />
      );

    case "TESTIMONIALS":
      return (
        <TestimonialsBlockEditor
          block={block}
          handleUpdate={handleUpdate}
          fieldClass={fieldClass}
        />
      );

    default:
      return null;
  }
};