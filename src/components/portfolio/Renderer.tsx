import React from "react";
import * as motion from "framer-motion/client";
import { ExternalLink, Terminal, Briefcase, Zap } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Hero = ({ data }: any) => (
  <section className="relative pt-32 pb-24 px-8 sm:px-12 overflow-hidden bg-zinc-950 min-h-[60vh] flex flex-col justify-center">
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)",
      }}
    />

    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="relative z-10 max-w-4xl mx-auto w-full"
    >
      <motion.div variants={fadeInUp} className="w-16 h-1 bg-violet-500 mb-10 rounded-full" />

      <motion.h1
        variants={fadeInUp}
        className="text-6xl sm:text-8xl font-black tracking-tighter text-zinc-100 leading-[1.1] mb-8"
      >
        {data.fullName || "Your Name"}
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        className="text-xl sm:text-2xl text-zinc-400 max-w-2xl leading-relaxed font-light"
      >
        {data.bio || "Crafting digital experiences with code and design."}
      </motion.p>

      <motion.div variants={fadeInUp} className="mt-20 flex items-center gap-6 opacity-60">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-zinc-500">
          Portfolio OS
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      </motion.div>
    </motion.div>
  </section>
);

const Projects = ({ data }: any) => {
  const items = data.items || [];
  return (
    <section className="py-24 px-8 sm:px-12 bg-zinc-950 border-t border-zinc-900">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto w-full"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-16">
          <Terminal className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">
            Selected Work
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs font-mono text-zinc-500">
            {String(items.length).padStart(2, "0")}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="group relative rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-6 sm:p-8 hover:bg-zinc-900 transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-violet-400 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-zinc-100 tracking-tight group-hover:text-violet-400 transition-colors mb-4">
                {item.title || "Untitled Project"}
              </h3>
              
              <p className="text-zinc-400 leading-relaxed text-sm flex-1">
                {item.description || "Project description will appear here once added in the editor."}
              </p>
            </motion.div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-20 rounded-2xl border border-dashed border-zinc-800 text-center text-zinc-500">
              Add projects in the editor to see them here.
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

const Skills = ({ data }: any) => {
  const skills = data.items || [];
  return (
    <section className="py-20 px-8 sm:px-12 bg-zinc-900/30 border-y border-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto w-full relative z-10"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-12">
          <Zap className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">
            Technical Stack
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </motion.div>

        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
          {skills.map((skill: string, i: number) => (
            <span
              key={i}
              className="px-4 py-2 bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-md rounded-full text-zinc-300 text-sm font-medium hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all cursor-default shadow-sm"
            >
              {skill}
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-sm text-zinc-500 italic">No skills added yet.</span>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

const Experience = ({ data }: any) => (
  <section className="py-24 px-8 sm:px-12 bg-zinc-950">
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="max-w-3xl mx-auto w-full"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-16">
        <Briefcase className="w-5 h-5 text-amber-500" />
        <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">
          Work History
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </motion.div>

      <div className="space-y-0 relative border-l border-zinc-800 ml-3 pl-8 sm:pl-12">
        {data.items?.map((item: any, i: number) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="relative pb-16 last:pb-0 group"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[37px] sm:-left-[53px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-700 group-hover:border-amber-500 group-hover:bg-amber-500/20 transition-colors shadow-[0_0_0_4px_#09090b]" />

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-zinc-100">
                {item.company}
              </h3>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full w-fit">
                {item.years}
              </span>
            </div>
            
            <p className="text-base text-zinc-400 group-hover:text-zinc-300 transition-colors">
              {item.role}
            </p>
          </motion.div>
        ))}

        {(!data.items || data.items.length === 0) && (
          <p className="text-sm text-zinc-500">No experience entries yet.</p>
        )}
      </div>
    </motion.div>
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
    <div className="bg-zinc-950 min-h-full font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {sections.map((section) => {
        const Component = BlockMap[section.type];
        return Component ? (
          <Component key={section.id} data={section.content} />
        ) : null;
      })}
    </div>
  );
};