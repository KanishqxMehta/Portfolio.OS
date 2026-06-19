import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, X } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { Section } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";

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

  if (block.type === "HERO") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className={labelClass}>Full Name</label>
          <Input
            placeholder="Kanishq Mehta"
            value={block.content?.fullName || ""}
            onChange={(e) => handleUpdate({ fullName: e.target.value })}
            className={cn(fieldClass, !block.content?.fullName && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
          />
          {!block.content?.fullName && (
            <p className="text-[10px] text-red-500 mt-0.5">Full name is required.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bio</label>
          <Textarea
            placeholder="A short, catchy bio..."
            className={cn(fieldClass, "min-h-[90px] h-auto resize-none", !block.content?.bio && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
            value={block.content?.bio || ""}
            onChange={(e) => handleUpdate({ bio: e.target.value })}
          />
          {!block.content?.bio && (
            <p className="text-[10px] text-red-500 mt-0.5">Bio is required.</p>
          )}
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
        <div className={cn("flex flex-wrap gap-1.5 min-h-[42px] p-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 transition-colors", skills.length === 0 ? "border-red-500/50" : "border-zinc-200 dark:border-zinc-700")}>
          {skills.length === 0 && (
            <span className="text-[11px] text-red-500 italic self-center">
              At least one skill is required.
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
        {items.length === 0 && (
          <p className="text-[11px] text-red-500 italic px-1">At least one experience entry is required.</p>
        )}
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
              className={cn(fieldClass, !item.company && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
            />
            {!item.company && (
              <p className="text-[10px] text-red-500 mt-0.5">Company name is required.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Input
                  placeholder="Role"
                  value={item.role}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].role = e.target.value;
                    handleUpdate({ items: newItems });
                  }}
                  className={cn(fieldClass, !item.role && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
                />
                {!item.role && (
                  <p className="text-[10px] text-red-500 mt-0.5">Role is required.</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="2022–Present"
                  value={item.years}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].years = e.target.value;
                    handleUpdate({ items: newItems });
                  }}
                  className={cn(fieldClass, !item.years && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
                />
                {!item.years && (
                  <p className="text-[10px] text-red-500 mt-0.5">Duration is required.</p>
                )}
              </div>
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
        {items.length === 0 && (
          <p className="text-[11px] text-red-500 italic px-1">At least one project is required.</p>
        )}
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
              className={cn(fieldClass, !item.title && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
            />
            {!item.title && (
              <p className="text-[10px] text-red-500 mt-0.5">Project title is required.</p>
            )}

            <Input
              placeholder="Project URL (optional, e.g., https://...)"
              value={item.link || ""}
              onChange={(e) => updateProject(idx, { link: e.target.value })}
              className={cn(fieldClass, item.link && !isValidUrl(item.link) && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
            />
            {item.link && !isValidUrl(item.link) && (
              <p className="text-[10px] text-red-500 mt-0.5">Please enter a valid URL (e.g., https://example.com)</p>
            )}

            <Textarea
              placeholder="What did you build?"
              value={item.description || ""}
              onChange={(e) =>
                updateProject(idx, { description: e.target.value })
              }
              className={cn(fieldClass, "min-h-[80px] h-auto resize-none", !item.description && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")}
            />
            {!item.description && (
              <p className="text-[10px] text-red-500 mt-0.5">Project description is required.</p>
            )}
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
        {items.length === 0 && (
          <p className="text-[11px] text-red-500 italic px-1">At least one education entry is required.</p>
        )}
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/edu transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Degree {idx + 1}</span>
              <button onClick={() => removeEducation(idx)} className="opacity-0 group-hover/edu:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <Input 
              placeholder="University or School" 
              value={item.school || ""} 
              onChange={(e) => updateEducation(idx, { school: e.target.value })} 
              className={cn(fieldClass, !item.school && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
            />
            {!item.school && (
              <p className="text-[10px] text-red-500 mt-0.5">School name is required.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Input 
                  placeholder="B.S. Computer Science" 
                  value={item.degree || ""} 
                  onChange={(e) => updateEducation(idx, { degree: e.target.value })} 
                  className={cn(fieldClass, !item.degree && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
                />
                {!item.degree && (
                  <p className="text-[10px] text-red-500 mt-0.5">Degree is required.</p>
                )}
              </div>
              <div className="space-y-1">
                <Input 
                  placeholder="2018 - 2022" 
                  value={item.year || ""} 
                  onChange={(e) => updateEducation(idx, { year: e.target.value })} 
                  className={cn(fieldClass, !item.year && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
                />
                {!item.year && (
                  <p className="text-[10px] text-red-500 mt-0.5">Year/years is required.</p>
                )}
              </div>
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
        {items.length === 0 && (
          <p className="text-[11px] text-red-500 italic px-1">At least one testimonial is required.</p>
        )}
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/test transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Testimonial {idx + 1}</span>
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
                {!item.author && (
                  <p className="text-[10px] text-red-500 mt-0.5">Author name is required.</p>
                )}
              </div>
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
          <Input 
            placeholder="you@example.com" 
            value={block.content?.emailTarget || ""} 
            onChange={(e) => handleUpdate({ emailTarget: e.target.value })} 
            className={cn(fieldClass, (!block.content?.emailTarget || !isValidEmail(block.content?.emailTarget)) && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
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

  return null;
};