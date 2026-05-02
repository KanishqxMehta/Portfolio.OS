import React from 'react';

const Hero = ({ data }: any) => (
  <section className="py-20 px-10 text-center border-b border-slate-50">
    <h1 className="text-6xl font-black tracking-tight text-slate-900 mb-4">
      {data.fullName || "Your Name"}
    </h1>
    <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
      {data.bio || "Crafting digital experiences with code and design."}
    </p>
  </section>
);

const Projects = ({ data }: any) => {
  const items = data.items || [];
  return (
    <section className="p-12">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">
        Featured Work
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div key={i} className="group cursor-default">
              <div className="aspect-video bg-slate-100 rounded-2xl mb-4 transition-transform group-hover:scale-[1.02] border border-slate-200 overflow-hidden flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                Project Preview
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {item.title || "Project Title"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {item.description || "Briefly explain the tech stack and the problem solved."}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-10 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300 text-sm italic">
            Add projects in the editor to see them here
          </div>
        )}
      </div>
    </section>
  );
};

// Add this component to your Renderer.tsx file

const Skills = ({ data }: any) => {
  const skills = data.items || [];
  return (
    <section className="py-12 px-10">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">
        Technical Proficiencies
      </h2>
      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
        {skills.map((skill: string, i: number) => (
          <div 
            key={i} 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-700 text-sm font-medium hover:border-blue-200 hover:bg-white transition-all shadow-sm"
          >
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
};

const Experience = ({ data }: any) => (
  <section className="py-12 px-10">
    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">Work History</h2>
    <div className="max-w-2xl mx-auto space-y-8">
      {data.items?.map((item: any, i: number) => (
        <div key={i} className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{item.company}</h3>
            <p className="text-slate-500">{item.role}</p>
          </div>
          <span className="text-sm font-mono text-slate-400">{item.years}</span>
        </div>
      ))}
    </div>
  </section>
);

const BlockMap: Record<string, React.FC<any>> = {
  HERO: Hero,
  PROJECTS: Projects,
  SKILLS: Skills,
  EXPERIENCE: Experience,
};

export const PortfolioRenderer = ({ sections }: { sections: any[] }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {sections.map((section) => {
        const Component = BlockMap[section.type];
        return Component ? <Component key={section.id} data={section.content} /> : null;
      })}
    </div>
  );
};