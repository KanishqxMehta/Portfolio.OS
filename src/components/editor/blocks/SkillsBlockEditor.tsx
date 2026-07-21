"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Section } from "@/lib/validations/portfolio";

interface SkillsBlockEditorProps {
  block: Section;
  handleUpdate: (newData: any) => void;
  labelClass: string;
  fieldClass: string;
}

export function SkillsBlockEditor({
  block,
  handleUpdate,
  labelClass,
  fieldClass,
}: SkillsBlockEditorProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const current = block.content?.items || [];

    const rawSkills = newSkill.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = Array.from(new Set([...current, ...rawSkills]));

    handleUpdate({ items: updated });
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    const current = block.content?.items || [];
    handleUpdate({ items: current.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Add Skills</label>
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
            Separate with commas or press Enter
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. React, TypeScript, Node.js"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            className={fieldClass}
          />
          <button
            onClick={addSkill}
            type="button"
            className="px-3 h-9 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {(block.content?.items || []).map((skill: string, idx: number) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-300/60 dark:border-zinc-700/60"
          >
            {skill}
            <button
              onClick={() => removeSkill(idx)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {(!block.content?.items || block.content.items.length === 0) && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
            No skills added yet. Type a skill above to start.
          </p>
        )}
      </div>
    </div>
  );
}
