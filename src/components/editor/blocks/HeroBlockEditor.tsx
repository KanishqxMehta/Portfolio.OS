"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

interface HeroBlockEditorProps {
  block: Section;
  handleUpdate: (newData: any) => void;
  labelClass: string;
  fieldClass: string;
  isValidUrl: (url: string) => boolean;
}

export function HeroBlockEditor({
  block,
  handleUpdate,
  labelClass,
  fieldClass,
  isValidUrl,
}: HeroBlockEditorProps) {
  const content: any = block.content || {};

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className={labelClass}>Full Name</label>
        <Input
          placeholder="Enter your full name"
          value={content.fullName || ""}
          onChange={(e) => handleUpdate({ fullName: e.target.value })}
          className={cn(
            fieldClass,
            !content.fullName &&
              "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
          )}
        />
        {!content.fullName && (
          <p className="text-[10px] text-red-500 mt-0.5">Full name is required.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Bio</label>
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
            Optional
          </span>
        </div>
        <Textarea
          placeholder="A short, catchy bio..."
          className={cn(fieldClass, "min-h-[90px] h-auto resize-none")}
          value={content.bio || ""}
          onChange={(e) => handleUpdate({ bio: e.target.value })}
        />
      </div>

      {/* Social Links Sub-section */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
          Social Profiles (Optional)
        </span>

        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.2">
            <label className={labelClass}>GitHub URL</label>
            <Input
              placeholder="https://github.com/username"
              value={content.github || ""}
              onChange={(e) => handleUpdate({ github: e.target.value })}
              className={cn(
                fieldClass,
                content.github &&
                  !isValidUrl(content.github) &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
              )}
            />
            {content.github && !isValidUrl(content.github) && (
              <p className="text-[10px] text-red-500 mt-0.5">
                Please enter a valid URL (e.g., https://github.com/...)
              </p>
            )}
          </div>

          <div className="space-y-1.2">
            <label className={labelClass}>LinkedIn URL</label>
            <Input
              placeholder="https://linkedin.com/in/username"
              value={content.linkedin || ""}
              onChange={(e) => handleUpdate({ linkedin: e.target.value })}
              className={cn(
                fieldClass,
                content.linkedin &&
                  !isValidUrl(content.linkedin) &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
              )}
            />
            {content.linkedin && !isValidUrl(content.linkedin) && (
              <p className="text-[10px] text-red-500 mt-0.5">
                Please enter a valid URL (e.g., https://linkedin.com/in/...)
              </p>
            )}
          </div>

          <div className="space-y-1.2">
            <label className={labelClass}>Instagram URL</label>
            <Input
              placeholder="https://instagram.com/username"
              value={content.instagram || ""}
              onChange={(e) => handleUpdate({ instagram: e.target.value })}
              className={cn(
                fieldClass,
                content.instagram &&
                  !isValidUrl(content.instagram) &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
              )}
            />
            {content.instagram && !isValidUrl(content.instagram) && (
              <p className="text-[10px] text-red-500 mt-0.5">
                Please enter a valid URL (e.g., https://instagram.com/...)
              </p>
            )}
          </div>

          <div className="space-y-1.2">
            <label className={labelClass}>Twitter / X URL</label>
            <Input
              placeholder="https://x.com/username"
              value={content.twitter || ""}
              onChange={(e) => handleUpdate({ twitter: e.target.value })}
              className={cn(
                fieldClass,
                content.twitter &&
                  !isValidUrl(content.twitter) &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
              )}
            />
            {content.twitter && !isValidUrl(content.twitter) && (
              <p className="text-[10px] text-red-500 mt-0.5">
                Please enter a valid URL (e.g., https://x.com/...)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
