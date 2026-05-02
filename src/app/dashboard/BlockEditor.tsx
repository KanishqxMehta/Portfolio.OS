import { usePortfolioStore } from "@/store/usePortfolioStore";

export const BlockEditor = ({ block }: { block: any }) => {
  const updateBlockData = usePortfolioStore((state) => state.updateBlockData);

  // 1. DEFINE handleUpdate HERE so all blocks can use it
  const handleUpdate = (newData: any) => {
    updateBlockData!(block.id, newData);
  };

  if (block.type === "HERO") {
    return (
      <div className="space-y-3">
        <input 
          placeholder="Your Full Name"
          className="w-full text-sm p-2 bg-slate-50 border rounded-md"
          value={block.content?.fullName || ""}
          onChange={(e) => handleUpdate({ fullName: e.target.value })}
        />
        <textarea 
          placeholder="A short, catchy bio..."
          className="w-full text-sm p-2 bg-slate-50 border rounded-md h-20"
          value={block.content?.bio || ""}
          onChange={(e) => handleUpdate({ bio: e.target.value })}
        />
      </div>
    );
  }

  // 2. NOW SKILLS HAS ACCESS TO handleUpdate
  if (block.type === "SKILLS") {
    const skills = block.content?.items || [];
    
    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = e.currentTarget.value.trim();
        if (value && !skills.includes(value)) {
          handleUpdate({ items: [...skills, value] }); // Works now!
          e.currentTarget.value = "";
        }
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          {skills.map((skill: string, idx: number) => (
            <span key={idx} className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
              {skill}
              <button 
                onClick={() => handleUpdate({ items: skills.filter((s: string) => s !== skill) })} 
                className="hover:text-blue-200 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input 
          placeholder="Add skill + Enter"
          className="w-full text-sm p-2 bg-white border border-slate-200 rounded-md"
          onKeyDown={handleAddSkill}
        />
      </div>
    );
  }

  if (block.type === "EXPERIENCE") {
    const items = block.content?.items || [{ company: "", role: "", years: "" }];
    return (
      <div className="space-y-4">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 border rounded-lg bg-slate-50 space-y-2">
            <input 
              placeholder="Company" 
              className="w-full text-sm p-2 border rounded"
              value={item.company}
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx].company = e.target.value;
                handleUpdate({ items: newItems });
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Role" className="text-sm p-2 border rounded" value={item.role} onChange={(e) => {
                const newItems = [...items]; newItems[idx].role = e.target.value; handleUpdate({ items: newItems });
              }}/>
              <input placeholder="Years (e.g. 2022-Pres)" className="text-sm p-2 border rounded" value={item.years} onChange={(e) => {
                const newItems = [...items]; newItems[idx].years = e.target.value; handleUpdate({ items: newItems });
              }}/>
            </div>
          </div>
        ))}
        <button onClick={() => handleUpdate({ items: [...items, { company: "", role: "", years: "" }] })} className="text-[10px] font-bold text-blue-600">+ Add Experience</button>
      </div>
    );
  }

  return null;
};