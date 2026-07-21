"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

interface ContactFormBlockEditorProps {
  block: Section;
  handleUpdate: (newData: any) => void;
  labelClass: string;
  fieldClass: string;
  isValidEmail: (email: string) => boolean;
}

export function ContactFormBlockEditor({
  block,
  handleUpdate,
  labelClass,
  fieldClass,
  isValidEmail,
}: ContactFormBlockEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className={labelClass}>Section Title (Optional)</label>
        <Input 
          placeholder="Let's work together." 
          value={block.content?.title || ""} 
          onChange={(e) => handleUpdate({ title: e.target.value })} 
          className={fieldClass} 
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Section Description (Optional)</label>
        <Textarea 
          placeholder="I'm currently open for new opportunities..." 
          value={block.content?.description || ""} 
          onChange={(e) => handleUpdate({ description: e.target.value })} 
          className={cn(fieldClass, "min-h-[70px] h-auto resize-none")} 
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Target Email Address</label>
        <Input 
          placeholder="you@example.com" 
          value={block.content?.emailTarget || ""} 
          onChange={(e) => handleUpdate({ emailTarget: e.target.value })} 
          className={cn(
            fieldClass, 
            (!block.content?.emailTarget || !isValidEmail(block.content?.emailTarget)) && 
              "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
          )} 
        />
        {!block.content?.emailTarget && (
          <p className="text-[10px] text-red-500 mt-0.5">Email address is required.</p>
        )}
        {block.content?.emailTarget && !isValidEmail(block.content?.emailTarget) && (
          <p className="text-[10px] text-red-500 mt-0.5">Please enter a valid email address (e.g., hello@domain.com)</p>
        )}
        <p className="text-[10px] text-zinc-500 mt-1">Visitors clicking the button will open their native mail app with this address pre-filled.</p>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Button Text</label>
        <Input 
          placeholder="Send me an email" 
          value={block.content?.buttonText || ""} 
          onChange={(e) => handleUpdate({ buttonText: e.target.value })} 
          className={cn(fieldClass, !block.content?.buttonText && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
        />
        {!block.content?.buttonText && (
          <p className="text-[10px] text-red-500 mt-0.5">Button text is required.</p>
        )}
      </div>
    </div>
  );
}
