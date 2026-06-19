import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, X } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";

const fieldClass =
  "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/60 h-9 text-sm rounded-lg transition-colors";

const labelClass =
  "text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500";

export const BlockEditor = ({ block }: { block: any }) => {
  const updateBlockData = usePortfolioStore((state) => state.updateBlockData);

  const handleUpdate = (newData: any) => {
    updateBlockData!(block.id, newData);
  };

  if (block.type === "HERO") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className={labelClass}>Full Name</label>
          <Input
            placeholder="Kanishq Mehta"
            value={block.content?.fullName || ""}
            onChange={(e) => handleUpdate({ fullName: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bio</label>
          <Textarea
            placeholder="A short, catchy bio..."
            className={`${fieldClass} min-h-[90px] h-auto resize-none`}
            value={block.content?.bio || ""}
            onChange={(e) => handleUpdate({ bio: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (block.type === "SKILLS") {
    const skills = block.content?.items || [];

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = e.currentTarget.value.trim();
        if (value && !skills.includes(value)) {
          handleUpdate({ items: [...skills, value] });
          e.currentTarget.value = "";
        }
      }
    };

    return (
      <div className="space-y-3">
        {/* Skills display */}
        <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 transition-colors">
          {skills.length === 0 && (
            <span className="text-[11px] text-zinc-600 italic self-center">
              Add skills below...
            </span>
          )}
          {skills.map((skill: string, idx: number) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none transition-colors"
            >
              {skill}
              <button
                onClick={() =>
                  handleUpdate({
                    items: skills.filter((s: string) => s !== skill),
                  })
                }
                className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Type a skill and press Enter"
          onKeyDown={handleAddSkill}
          className={fieldClass}
        />
      </div>
    );
  }

  if (block.type === "EXPERIENCE") {
    const items = block.content?.items || [
      { company: "", role: "", years: "" },
    ];

    return (
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/exp transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                Entry {idx + 1}
              </span>
              <button
                onClick={() =>
                  handleUpdate({
                    items: items.filter((_: any, i: number) => i !== idx),
                  })
                }
                className="opacity-0 group-hover/exp:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <Input
              placeholder="Company name"
              value={item.company}
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx].company = e.target.value;
                handleUpdate({ items: newItems });
              }}
              className={fieldClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Role"
                value={item.role}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].role = e.target.value;
                  handleUpdate({ items: newItems });
                }}
                className={fieldClass}
              />
              <Input
                placeholder="2022–Present"
                value={item.years}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].years = e.target.value;
                  handleUpdate({ items: newItems });
                }}
                className={fieldClass}
              />
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            handleUpdate({
              items: [...items, { company: "", role: "", years: "" }],
            })
          }
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all"
        >
          <Plus className="w-3 h-3" /> Add Entry
        </button>
      </div>
    );
  }

  if (block.type === "PROJECTS") {
    // Look closely here: we added 'link: ""' to the default fallback array item
    const items = block.content?.items || [{ title: "", description: "", link: "" }];

    const updateProject = (index: number, fields: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...fields };
      handleUpdate({ items: newItems });
    };

    const addProject = () => {
      handleUpdate({ items: [...items, { title: "", description: "", link: "" }] });
    };

    const removeProject = (index: number) => {
      handleUpdate({ items: items.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/proj transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                Project {idx + 1}
              </span>
              <button
                onClick={() => removeProject(idx)}
                className="opacity-0 group-hover/proj:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <Input
              placeholder="Project title"
              value={item.title || ""}
              onChange={(e) => updateProject(idx, { title: e.target.value })}
              className={fieldClass}
            />

            <Input
              placeholder="Project URL (optional, e.g., https://...)"
              value={item.link || ""}
              onChange={(e) => updateProject(idx, { link: e.target.value })}
              className={fieldClass}
            />

            <Textarea
              placeholder="What did you build?"
              value={item.description || ""}
              onChange={(e) =>
                updateProject(idx, { description: e.target.value })
              }
              className={`${fieldClass} min-h-[80px] h-auto resize-none`}
            />
          </div>
        ))}

        <button
          onClick={addProject}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all"
        >
          <Plus className="w-3 h-3" /> Add Project
        </button>
      </div>
    );
  }
  if (block.type === "EDUCATION") {
    const items = block.content?.items || [{ school: "", degree: "", year: "" }];

    const updateEducation = (index: number, fields: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...fields };
      handleUpdate({ items: newItems });
    };

    const removeEducation = (index: number) => {
      handleUpdate({ items: items.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/edu transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Degree {idx + 1}</span>
              <button onClick={() => removeEducation(idx)} className="opacity-0 group-hover/edu:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <Input placeholder="University or School" value={item.school || ""} onChange={(e) => updateEducation(idx, { school: e.target.value })} className={fieldClass} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="B.S. Computer Science" value={item.degree || ""} onChange={(e) => updateEducation(idx, { degree: e.target.value })} className={fieldClass} />
              <Input placeholder="2018 - 2022" value={item.year || ""} onChange={(e) => updateEducation(idx, { year: e.target.value })} className={fieldClass} />
            </div>
          </div>
        ))}
        <button onClick={() => handleUpdate({ items: [...items, { school: "", degree: "", year: "" }] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all">
          <Plus className="w-3 h-3" /> Add Degree
        </button>
      </div>
    );
  }

  if (block.type === "TESTIMONIALS") {
    const items = block.content?.items || [{ quote: "", author: "", role: "" }];

    const updateTestimonial = (index: number, fields: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...fields };
      handleUpdate({ items: newItems });
    };

    const removeTestimonial = (index: number) => {
      handleUpdate({ items: items.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/test transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Testimonial {idx + 1}</span>
              <button onClick={() => removeTestimonial(idx)} className="opacity-0 group-hover/test:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <Textarea placeholder="“Amazing developer to work with...”" value={item.quote || ""} onChange={(e) => updateTestimonial(idx, { quote: e.target.value })} className={`${fieldClass} min-h-[80px] h-auto resize-none`} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="John Doe" value={item.author || ""} onChange={(e) => updateTestimonial(idx, { author: e.target.value })} className={fieldClass} />
              <Input placeholder="CTO @ TechCorp" value={item.role || ""} onChange={(e) => updateTestimonial(idx, { role: e.target.value })} className={fieldClass} />
            </div>
          </div>
        ))}
        <button onClick={() => handleUpdate({ items: [...items, { quote: "", author: "", role: "" }] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all">
          <Plus className="w-3 h-3" /> Add Testimonial
        </button>
      </div>
    );
  }

  if (block.type === "CONTACT_FORM") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className={labelClass}>Target Email Address</label>
          <Input placeholder="you@example.com" value={block.content?.emailTarget || ""} onChange={(e) => handleUpdate({ emailTarget: e.target.value })} className={fieldClass} />
          <p className="text-[10px] text-zinc-500 mt-1">Visitors clicking the button will open their native mail app with this address pre-filled.</p>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Button Text</label>
          <Input placeholder="Send me an email" value={block.content?.buttonText || ""} onChange={(e) => handleUpdate({ buttonText: e.target.value })} className={fieldClass} />
        </div>
      </div>
    );
  }

  return null;
};