import React from "react";
import * as motion from "framer-motion/client";
import { ExternalLink, Terminal, Briefcase, Zap, Code2, GraduationCap, MessageSquare, Quote, Send } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

import { THEMES } from "@/lib/themes";
import {
  Section,
  HeroContent,
  SkillsContent,
  ExperienceContent,
  ProjectsContent,
  EducationContent,
  TestimonialsContent,
  ContactFormContent,
} from "@/lib/validations/portfolio";

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

const Hero = ({ data }: { data: HeroContent }) => {
  return (
  <section className="theme-bg relative pt-32 pb-24 px-8 sm:px-12 overflow-hidden min-h-[60vh] flex flex-col justify-center transition-colors duration-500">
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `radial-gradient(var(--p-border) 2px, transparent 2px)`,
        backgroundSize: "24px 24px",
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
      <motion.div variants={fadeInUp} className="w-16 h-1 bg-[var(--p-primary)] mb-10 rounded-full transition-colors duration-500" />

      <motion.h1
        variants={fadeInUp}
        className="text-6xl sm:text-8xl font-black tracking-tighter text-[var(--p-fg)] leading-[1.1] mb-8 transition-colors duration-500"
      >
        {data.fullName || "Your Name"}
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        className={`text-[var(--p-fg-muted)] max-w-none leading-relaxed font-light transition-all duration-500 ${
          (data.bio || "").length > 180
            ? "text-base sm:text-lg"
            : (data.bio || "").length > 120
            ? "text-lg sm:text-xl"
            : "text-xl sm:text-2xl"
        }`}
      >
        {data.bio || "Crafting digital experiences with code and design."}
      </motion.p>

      {/* Social links row */}
      {(data.github || data.linkedin || data.instagram || data.twitter) && (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {data.github && (
            <a
              href={data.github}
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              className="w-11 h-11 rounded-full border border-[var(--p-border)] bg-[var(--p-bg-secondary)] flex items-center justify-center text-[var(--p-fg-muted)] hover:text-[var(--p-primary)] hover:border-[var(--p-primary)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {data.linkedin && (
            <a
              href={data.linkedin}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
              className="w-11 h-11 rounded-full border border-[var(--p-border)] bg-[var(--p-bg-secondary)] flex items-center justify-center text-[var(--p-fg-muted)] hover:text-[var(--p-primary)] hover:border-[var(--p-primary)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
          )}
          {data.instagram && (
            <a
              href={data.instagram}
              target="_blank"
              rel="noreferrer"
              title="Instagram"
              className="w-11 h-11 rounded-full border border-[var(--p-border)] bg-[var(--p-bg-secondary)] flex items-center justify-center text-[var(--p-fg-muted)] hover:text-[var(--p-primary)] hover:border-[var(--p-primary)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
          )}
          {data.twitter && (
            <a
              href={data.twitter}
              target="_blank"
              rel="noreferrer"
              title="Twitter / X"
              className="w-11 h-11 rounded-full border border-[var(--p-border)] bg-[var(--p-bg-secondary)] flex items-center justify-center text-[var(--p-fg-muted)] hover:text-[var(--p-primary)] hover:border-[var(--p-primary)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <TwitterIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      )}

      <motion.div variants={fadeInUp} className="mt-20 flex items-center gap-6 opacity-60">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--p-border)] to-transparent transition-colors duration-500" />
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--p-fg-muted)] transition-colors duration-500">
          Portfolio OS
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--p-border)] to-transparent transition-colors duration-500" />
      </motion.div>
    </motion.div>
  </section>
);
};

const Projects = ({ data }: { data: ProjectsContent }) => {
  const items = data.items || [];
  return (
    <section className="theme-bg py-24 px-8 sm:px-12 border-t border-[var(--p-border)] transition-colors duration-500">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto w-full"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-16">
          <Terminal className="w-5 h-5 text-[var(--p-primary)] transition-colors duration-500" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--p-fg)] transition-colors duration-500">
            Selected Work
          </span>
          <div className="h-px flex-1 bg-[var(--p-border)] transition-colors duration-500" />
          <span className="text-xs font-mono text-[var(--p-fg-muted)] transition-colors duration-500">
            {String(items.length).padStart(2, "0")}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="theme-card group relative bg-[var(--p-bg-card)] border-[var(--p-border)] p-6 sm:p-8 hover:bg-[var(--p-bg-secondary)] transition-all duration-300 hover:border-[var(--p-primary)] flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                {item.link ? (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="theme-card w-12 h-12 bg-[var(--p-bg-secondary)] border-[var(--p-border)] flex items-center justify-center text-[var(--p-fg-muted)] hover:text-[var(--p-primary)] hover:border-[var(--p-primary)] transition-all duration-200"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                ) : (
                  <div className="theme-card w-12 h-12 bg-[var(--p-bg-secondary)] border-[var(--p-border)] flex items-center justify-center text-[var(--p-fg-muted)] transition-colors cursor-default">
                    <Code2 className="w-5 h-5" />
                  </div>
                )}
                
                <span className="font-mono text-xs text-[var(--p-fg-muted)] transition-colors duration-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[var(--p-fg)] tracking-tight group-hover:text-[var(--p-primary)] transition-colors mb-4">
                {item.title || "Untitled Project"}
              </h3>
              
              <p className="text-[var(--p-fg-muted)] leading-relaxed text-sm flex-1 transition-colors duration-500">
                {item.description || "Project description will appear here once added in the editor."}
              </p>
            </motion.div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-20 rounded-2xl border border-dashed border-[var(--p-border)] text-center text-[var(--p-fg-muted)] transition-colors duration-500">
              Add projects in the editor to see them here.
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

const Skills = ({ data }: { data: SkillsContent }) => {
  const skills = data.items || [];
  return (
    <section className="theme-bg-secondary py-20 px-8 sm:px-12 border-y border-[var(--p-border)] relative overflow-hidden transition-colors duration-500">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto w-full relative z-10"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-12">
          <Zap className="w-5 h-5 text-[var(--p-primary)] transition-colors duration-500" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--p-fg)] transition-colors duration-500">
            Technical Stack
          </span>
          <div className="h-px flex-1 bg-[var(--p-border)] transition-colors duration-500" />
        </motion.div>

        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
          {skills.map((skill: string, i: number) => (
            <span
              key={i}
              className="theme-pill px-4 py-2 border-[var(--p-border)] text-[var(--p-fg)] text-sm font-medium hover:border-[var(--p-primary)] hover:text-[var(--p-primary)] transition-all cursor-default"
            >
              {skill}
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-sm text-[var(--p-fg-muted)] italic transition-colors duration-500">No skills added yet.</span>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

const Experience = ({ data }: { data: ExperienceContent }) => (
  <section className="theme-bg py-24 px-8 sm:px-12 transition-colors duration-500">
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="max-w-3xl mx-auto w-full"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-16">
        <Briefcase className="w-5 h-5 text-[var(--p-primary)] transition-colors duration-500" />
        <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--p-fg)] transition-colors duration-500">
          Work History
        </span>
        <div className="h-px flex-1 bg-[var(--p-border)] transition-colors duration-500" />
      </motion.div>

      <div className="theme-border-l space-y-0 relative border-[var(--p-border)] ml-3 transition-colors duration-500">
        {data.items?.map((item: any, i: number) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="relative pb-16 last:pb-0 group pl-8 sm:pl-12"
          >
            {/* Timeline dot */}
            <div className="theme-dot absolute left-0 -translate-x-1/2 top-1.5 w-4 h-4 bg-[var(--p-bg-secondary)] border-[var(--p-border)] group-hover:border-[var(--p-primary)] group-hover:bg-[var(--p-primary)] transition-colors shadow-[0_0_0_4px_var(--p-bg)]" style={{ borderRadius: 'var(--p-radius)' }} />

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-[var(--p-fg)] transition-colors duration-500">
                {item.company || "Company Name"}
              </h3>
              <span className="text-xs font-mono text-[var(--p-fg-muted)] bg-[var(--p-bg-secondary)] border border-[var(--p-border)] px-3 py-1 rounded-full w-fit transition-colors duration-500">
                {item.years || "2023 - Present"}
              </span>
            </div>
            
            <p className="text-base text-[var(--p-fg-muted)] group-hover:text-[var(--p-fg)] transition-colors">
              {item.role || "Role / Position"}
            </p>
          </motion.div>
        ))}

        {(!data.items || data.items.length === 0) && (
          <p className="text-sm text-[var(--p-fg-muted)] transition-colors duration-500 pl-8 sm:pl-12">No experience entries yet.</p>
        )}
      </div>
    </motion.div>
  </section>
);

const Education = ({ data }: { data: EducationContent }) => (
  <section className="theme-bg py-24 px-8 sm:px-12 transition-colors duration-500">
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="max-w-3xl mx-auto w-full"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-16">
        <GraduationCap className="w-5 h-5 text-[var(--p-primary)] transition-colors duration-500" />
        <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--p-fg)] transition-colors duration-500">
          Education
        </span>
        <div className="h-px flex-1 bg-[var(--p-border)] transition-colors duration-500" />
      </motion.div>

      <div className="theme-border-l space-y-0 relative border-[var(--p-border)] ml-3 transition-colors duration-500">
        {data.items?.map((item: any, i: number) => (
          <motion.div key={i} variants={fadeInUp} className="relative pb-12 last:pb-0 group pl-8 sm:pl-12">
            <div className="theme-dot absolute left-0 -translate-x-1/2 top-1.5 w-4 h-4 bg-[var(--p-bg-secondary)] border-[var(--p-border)] group-hover:border-[var(--p-primary)] group-hover:bg-[var(--p-primary)] transition-colors shadow-[0_0_0_4px_var(--p-bg)]" style={{ borderRadius: 'var(--p-radius)' }} />
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-[var(--p-fg)] transition-colors duration-500">{item.degree || "Degree / Program"}</h3>
              <span className="text-xs font-mono text-[var(--p-fg-muted)] bg-[var(--p-bg-secondary)] border border-[var(--p-border)] px-3 py-1 rounded-full w-fit transition-colors duration-500">{item.year || "Year"}</span>
            </div>
            <p className="text-base text-[var(--p-fg-muted)] group-hover:text-[var(--p-fg)] transition-colors">{item.school || "School / University"}</p>
          </motion.div>
        ))}
        {(!data.items || data.items.length === 0) && (
          <p className="text-sm text-[var(--p-fg-muted)] transition-colors duration-500 pl-8 sm:pl-12">No education entries yet.</p>
        )}
      </div>
    </motion.div>
  </section>
);

const Testimonials = ({ data }: { data: TestimonialsContent }) => (
  <section className="theme-bg py-24 px-8 sm:px-12 transition-colors duration-500">
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="max-w-4xl mx-auto w-full"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-16">
        <MessageSquare className="w-5 h-5 text-[var(--p-primary)] transition-colors duration-500" />
        <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--p-fg)] transition-colors duration-500">
          Recommendations
        </span>
        <div className="h-px flex-1 bg-[var(--p-border)] transition-colors duration-500" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.items?.map((item: any, i: number) => (
          <motion.div key={i} variants={fadeInUp} className="p-8 theme-bg-secondary border border-[var(--p-border)] relative group hover:border-[var(--p-primary)] transition-all duration-500 shadow-sm hover:shadow-xl" style={{ borderRadius: 'var(--p-radius)' }}>
            <Quote className="w-10 h-10 text-[var(--p-primary)] opacity-20 absolute top-6 right-6 group-hover:opacity-40 transition-opacity duration-500" />
            <p className="text-base leading-relaxed text-[var(--p-fg)] font-medium mb-8 relative z-10">"{item.quote}"</p>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[var(--p-fg)]">{item.author}</span>
              <span className="text-sm text-[var(--p-fg-muted)]">{item.role}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const ContactForm = ({ data }: { data: ContactFormContent }) => {
  const email = data.emailTarget || "hello@example.com";
  const btnText = data.buttonText || "Get in Touch";
  return (
    <section className="theme-bg py-32 px-8 sm:px-12 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--p-bg-secondary)] opacity-50" />
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-2xl mx-auto w-full text-center relative z-10"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--p-fg)] mb-6 tracking-tight">Let's work together.</h2>
          <p className="text-lg text-[var(--p-fg-muted)] mb-10 max-w-lg mx-auto leading-relaxed">
            I'm currently open for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
          <a
            href={`mailto:${email}`}
            className="theme-pill inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-[var(--p-fg)] border-[var(--p-border)] shadow-[var(--p-shadow)] hover:shadow-[var(--p-shadow-hover)] hover:scale-105 active:scale-95 transition-all group/mail"
          >
            <Send className="w-4 h-4 group-hover/mail:translate-x-1 group-hover/mail:-translate-y-1 transition-transform" />
            {btnText}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

const BlockMap: Record<string, React.FC<{ data: any }>> = {
  HERO: Hero,
  PROJECTS: Projects,
  SKILLS: Skills,
  EXPERIENCE: Experience,
  EDUCATION: Education,
  // TESTIMONIALS: Testimonials,
  CONTACT_FORM: ContactForm,
};

const InkSplashes = () => (
  <div className="pointer-events-none absolute inset-0 z-[20] overflow-hidden opacity-[0.15] mix-blend-multiply transition-opacity duration-1000">
    <svg className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] text-[var(--p-primary)]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.5,-40.8C85.8,-26.3,92.3,-11.3,91.5,3.3C90.7,17.9,82.5,32.2,71.7,42.7C60.9,53.2,47.5,59.9,33.5,65.3C19.5,70.7,4.9,74.8,-10.8,77.3C-26.5,79.8,-43.3,80.7,-57.3,73.4C-71.3,66.1,-82.5,50.6,-86.6,33.9C-90.7,17.2,-87.7,-0.7,-81.4,-16.9C-75.1,-33.1,-65.5,-47.6,-52.7,-55.8C-39.9,-64,-24,-65.9,-8.8,-62.4C6.4,-58.9,21.6,-50,32.5,-55.3L45.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
      <circle fill="currentColor" cx="160" cy="40" r="8" />
      <circle fill="currentColor" cx="180" cy="70" r="4" />
      <circle fill="currentColor" cx="140" cy="20" r="12" />
      <circle fill="currentColor" cx="40" cy="160" r="6" />
    </svg>
    <svg className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] text-[var(--p-primary)]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M51.9,-72.5C65.5,-63.9,73.5,-46.8,79.1,-29.3C84.7,-11.8,87.9,6.1,82.6,21.5C77.3,36.9,63.5,49.8,48.7,59.3C33.9,68.8,18.1,74.9,0.9,73.6C-16.3,72.3,-32.6,63.6,-46.8,53C-61,42.4,-73.1,29.9,-79.1,14.6C-85.1,-0.7,-85,-18.8,-77.1,-33.5C-69.2,-48.2,-53.5,-59.5,-38.5,-67.5C-23.5,-75.5,-9.2,-80.2,5.7,-88.2C20.6,-96.2,38.3,-81.1,51.9,-72.5Z" transform="translate(100 100)" />
      <circle fill="currentColor" cx="40" cy="150" r="15" />
      <circle fill="currentColor" cx="20" cy="120" r="7" />
      <circle fill="currentColor" cx="60" cy="180" r="5" />
      <circle fill="currentColor" cx="150" cy="40" r="10" />
    </svg>
    <svg className="absolute top-[45%] left-[55%] w-[300px] h-[300px] text-[var(--p-primary)] opacity-50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M38.8,-60.9C52.2,-55.8,66.3,-48.5,75.9,-36.4C85.5,-24.3,90.6,-7.4,85.6,6.3C80.6,20,65.5,30.5,53.2,42.4C40.9,54.3,31.4,67.6,18.7,73.4C6,79.2,-9.9,77.5,-23.4,71.2C-36.9,64.9,-48,54,-57.4,41.9C-66.8,29.8,-74.5,16.5,-76.4,2.2C-78.3,-12.1,-74.4,-27.4,-65,-38.7C-55.6,-50,-40.7,-57.3,-27.2,-62.1C-13.7,-66.9,-1.6,-69.2,11.2,-69.2C24,-69.2,36.8,-66.9,38.8,-60.9Z" transform="translate(100 100) scale(0.6)" />
      <circle fill="currentColor" cx="140" cy="60" r="6" />
      <circle fill="currentColor" cx="50" cy="140" r="4" />
      <circle fill="currentColor" cx="150" cy="130" r="3" />
    </svg>
  </div>
);

export const PortfolioRenderer = ({ sections, theme = "classic" }: { sections: Section[], theme?: string }) => {
  const activeTheme = THEMES[theme] || THEMES["classic"];
  
  // Reorder sections so that CONTACT_FORM is always rendered at the very bottom
  const visibleSections = sections.filter((s) => s.isVisible !== false);
  const nonContactSections = visibleSections.filter((s) => s.type !== "CONTACT_FORM");
  const contactSections = visibleSections.filter((s) => s.type === "CONTACT_FORM");
  const orderedSections = [...nonContactSections, ...contactSections];

  return (
    <div 
      data-theme={theme}
      className="theme-bg min-h-full font-sans transition-colors duration-500 relative"
      style={{
        ...activeTheme.cssVars,
        fontFamily: activeTheme.cssVars["--p-font"],
        color: "var(--p-fg)",
      } as React.CSSProperties}
    >
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[var(--p-noise-opacity,0)] transition-opacity duration-500"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      {theme === "paper" && <InkSplashes />}
      <style>{`
        .theme-bg { background: var(--p-bg); }
        .theme-bg-secondary { background: var(--p-bg-secondary); }
        .theme-card {
          border-radius: var(--p-radius);
          border-width: var(--p-border-width);
          border-style: var(--p-border-style);
          box-shadow: var(--p-shadow);
          backdrop-filter: var(--p-blur);
          -webkit-backdrop-filter: var(--p-blur);
        }
        .theme-card:hover {
          box-shadow: var(--p-shadow-hover);
          transform: var(--p-transform-hover);
        }
        .theme-pill {
          background-color: var(--p-pill-bg);
          border-radius: var(--p-radius);
          border-width: var(--p-border-width);
          border-style: var(--p-border-style);
          backdrop-filter: var(--p-blur);
          -webkit-backdrop-filter: var(--p-blur);
        }
        .theme-dot {
          border-width: var(--p-border-width);
          border-style: var(--p-border-style);
        }
        .theme-border-l {
          border-left-width: var(--p-border-width);
          border-left-style: var(--p-border-style);
        }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+1) { background-color: #ffeaa7; }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+2) { background-color: #fab1a0; }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+3) { background-color: #81ecec; }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+4) { background-color: #a29bfe; }

        /* Ensure card hover states preserve their specific background colors */
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+1):hover { background-color: #ffeaa7 !important; }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+2):hover { background-color: #fab1a0 !important; }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+3):hover { background-color: #81ecec !important; }
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+4):hover { background-color: #a29bfe !important; }

        /* Match open/link button background colors using darker shades of the card background */
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+1) .theme-card { background-color: #fdcb6e; } /* Yellow card gets Darker Gold/Yellow */
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+2) .theme-card { background-color: #e17055; } /* Peach card gets Darker Coral/Peach */
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+3) .theme-card { background-color: #00cec9; } /* Cyan card gets Darker Cyan/Turquoise */
        [data-theme="neobrutalism"] div.grid > div.theme-card:nth-child(4n+4) .theme-card { background-color: #6c5ce7; } /* Purple card gets Darker Purple */

        /* Highlight buttons cleanly on hover in brutalist style */
        [data-theme="neobrutalism"] div.grid > div.theme-card .theme-card:hover {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: var(--p-fg) !important;
        }

        [data-theme="neobrutalism"] .theme-pill:nth-child(4n+1) { background-color: #ff4757; color: #fff; }
        [data-theme="neobrutalism"] .theme-pill:nth-child(4n+2) { background-color: #2ed573; color: #111; }
        [data-theme="neobrutalism"] .theme-pill:nth-child(4n+3) { background-color: #1e90ff; color: #fff; }
        [data-theme="neobrutalism"] .theme-pill:nth-child(4n+4) { background-color: #ffb703; color: #111; }
      `}</style>
      <div className="relative z-10">
        {orderedSections.map((section) => {
          const Component = BlockMap[section.type];
          if (!Component) return null;
          const items = (section.content as any)?.items;
          const contentKey = Array.isArray(items) ? items.length : 0;
          return <Component key={`${section.id}-v${contentKey}`} data={section.content} />;
        })}
      </div>
    </div>
  );
};