"use client";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { BlockEditor } from "../BlockEditor";

export default function EditPortfolioPage() {
  const { sections, addBlock, username, setUsername, savePortfolio, isSaving, moveBlock, removeBlock } = usePortfolioStore();

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] text-slate-900">
      {/* Navbar */}
      <nav className="h-14 bg-white border-b px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-6">
          <div className="font-black text-xl tracking-tighter text-blue-600">PORTFOLIO.OS</div>
          <input 
            className="bg-slate-100 border-none rounded-full px-4 py-1 text-sm w-48 focus:ring-2 focus:ring-blue-500"
            placeholder="username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button 
          onClick={savePortfolio}
          disabled={isSaving}
          className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Side */}
        <aside className="w-[400px] bg-white border-r flex flex-col shadow-xl z-10">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <header>
              <h2 className="text-lg font-bold">Content Blocks</h2>
              <p className="text-xs text-slate-500">Add and edit your sections here.</p>
            </header>

            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={section.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                      {section.type}
                    </span>
                    
                    {/* NEW: Reorder and Delete Controls */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock!(section.id, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400">▲</button>
                      <button onClick={() => moveBlock!(section.id, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400">▼</button>
                      <button onClick={() => removeBlock!(section.id)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 ml-1">✕</button>
                    </div>
                  </div>
                  <BlockEditor block={section} />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t grid grid-cols-2 gap-2">
            <button onClick={() => addBlock("HERO", "Hero")} className="text-xs font-bold p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all">
              + Hero
            </button>
            <button onClick={() => addBlock("PROJECTS", "Projects")} className="text-xs font-bold p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all">
              + Projects
            </button>
            <button 
              onClick={() => addBlock("SKILLS", "Skills & Tech")} 
              className="text-xs font-bold p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all"
            >
              + Skills
            </button>
            <button 
              onClick={() => addBlock("EXPERIENCE", "Experience")} 
              className="text-xs font-bold p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all"
            >
              + EXPERIENCE
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 bg-slate-100 flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-t-xl border-x border-t border-slate-300 h-8 flex items-center px-4 gap-1.5 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>
            <div className="bg-white border border-slate-300 rounded-b-xl shadow-2xl min-h-[800px] overflow-hidden">
               <PortfolioRenderer sections={sections} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}