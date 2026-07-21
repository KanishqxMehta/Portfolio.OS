"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Section } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

interface TestimonialsBlockEditorProps {
  block: Section;
  handleUpdate: (newData: any) => void;
  fieldClass: string;
}

export function TestimonialsBlockEditor({
  block,
  handleUpdate,
  fieldClass,
}: TestimonialsBlockEditorProps) {
  const content: any = block.content || {};
  const items = content.items || [{ quote: "", author: "", role: "" }];

  const updateTestimonial = (index: number, fields: any) => {
    const newItems = items.map((it: any, i: number) =>
      i === index ? { ...it, ...fields } : { ...it }
    );
    handleUpdate({ items: newItems });
  };

  const removeTestimonial = (index: number) => {
    handleUpdate({ items: items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-[11px] text-red-500 italic px-1">At least one testimonial is required.</p>
      )}
      {items.map((item: any, idx: number) => (
        <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/test transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Testimonial {idx + 1}</span>
            <button onClick={() => removeTestimonial(idx)} className="opacity-0 group-hover/test:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <Textarea 
            placeholder="“Amazing developer to work with...”" 
            value={item.quote || ""} 
            onChange={(e) => updateTestimonial(idx, { quote: e.target.value })} 
            className={cn(fieldClass, "min-h-[80px] h-auto resize-none", !item.quote && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
          />
          {!item.quote && (
            <p className="text-[10px] text-red-500 mt-0.5">Quote content is required.</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Input 
                placeholder="John Doe" 
                value={item.author || ""} 
                onChange={(e) => updateTestimonial(idx, { author: e.target.value })} 
                className={cn(fieldClass, !item.author && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
              />
            </div>
            <Input placeholder="CTO @ TechCorp" value={item.role || ""} onChange={(e) => updateTestimonial(idx, { role: e.target.value })} className={fieldClass} />
          </div>
        </div>
      ))}
      <button onClick={() => handleUpdate({ items: [...items, { quote: "", author: "", role: "" }] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 transition-all cursor-pointer">
        <Plus className="w-3 h-3" /> Add Testimonial
      </button>
    </div>
  );
}
