import React from "react";
import * as motion from "framer-motion/client";
import { Briefcase, GraduationCap, Quote, Send, ArrowRight, Globe } from "lucide-react";
import {
  HeroContent,
  SkillsContent,
  ExperienceContent,
  ProjectsContent,
  EducationContent,
  TestimonialsContent,
  ContactFormContent,
} from "@/lib/validations/portfolio";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
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

/* ─── HERO ─── */
const SidebarHero = ({ data }: { data: HeroContent }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={staggerContainer}
    className="w-full flex flex-col justify-center py-8"
  >
    <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-[var(--p-fg)] leading-tight mb-6 tracking-tighter">
      {data.fullName || "Your Name"}
    </motion.h1>
    {data.bio && (
      <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[var(--p-fg-muted)] font-medium max-w-2xl leading-relaxed mb-10">
        {data.bio}
      </motion.p>
    )}
  </motion.div>
);

/* ─── SKILLS ─── */
const SidebarSkills = ({ data }: { data: SkillsContent }) => {
  const skills = data.items || [];
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="w-full py-8"
    >
      <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-[var(--p-fg)] tracking-tight mb-8">
        Technical Stack
      </motion.h2>
      <div className="flex flex-wrap gap-3">
        {skills.map((item, i) => (
          <motion.span key={i} variants={fadeInUp} className="theme-pill px-4 py-2 border-[var(--p-border)] text-[var(--p-fg)] font-medium text-sm hover:border-[var(--p-primary)] hover:text-[var(--p-primary)] transition-colors cursor-default">
            {item}
          </motion.span>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-[var(--p-fg-muted)] italic">No skills added yet.</span>
        )}
      </div>
    </motion.div>
  );
};

/* ─── EXPERIENCE ─── */
const SidebarExperience = ({ data }: { data: ExperienceContent }) => {
  const items = (data.items || []).filter((job: any) => job.isVisible !== false);
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-8"
    >
      <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-[var(--p-fg)] tracking-tight mb-10">
        Experience
      </motion.h2>
      <div className="space-y-0 relative ml-3">
        {items.map((job: any, i: number) => (
          <motion.div key={i} variants={fadeInUp} className="relative pb-10 last:pb-0 group pl-8 sm:pl-10">
            {/* connector line */}
            {i < items.length - 1 && (
              <div className="absolute bg-[var(--p-border)] transition-colors duration-500" style={{ top: '12px', bottom: '-12px', left: '0', width: 'var(--p-border-width, 1px)', transform: 'translateX(-50%)' }} />
            )}
            {/* dot */}
            <div className="theme-dot absolute left-0 top-1.5 w-3 h-3 bg-[var(--p-bg-secondary)] border-[var(--p-border)] group-hover:border-[var(--p-primary)] group-hover:bg-[var(--p-primary)] transition-colors shadow-[0_0_0_4px_var(--p-bg)] z-10" style={{ transform: 'translateX(-50%)' }} />

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
              <h3 className="text-lg font-bold text-[var(--p-fg)]">{job.role || "Role"}</h3>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--p-primary)] bg-[var(--p-primary)]/10 px-3 py-1 rounded-full w-fit">
                {job.years || ""}
              </span>
            </div>
            <p className="text-sm font-semibold text-[var(--p-fg)]/70 mb-3">{job.company || "Company"}</p>
            {job.description && (
              <p className="text-[var(--p-fg-muted)] leading-relaxed text-sm whitespace-pre-wrap">
                {job.description}
              </p>
            )}
          </motion.div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[var(--p-fg-muted)] italic">No experience entries yet.</p>
        )}
      </div>
    </motion.div>
  );
};

/* ─── PROJECTS ─── */
const SidebarProjects = ({ data }: { data: ProjectsContent }) => {
  const items = (data.items || []).filter((p: any) => p.isVisible !== false);
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-8"
    >
      <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-[var(--p-fg)] tracking-tight mb-10">
        Selected Work
      </motion.h2>
      <div className="grid grid-cols-1 gap-8">
        {items.map((project: any, i: number) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="theme-card group relative p-6 sm:p-8 bg-[var(--p-bg-card)] border-[var(--p-border)] hover:bg-[var(--p-bg-secondary)] transition-all duration-300 hover:border-[var(--p-primary)] flex flex-col"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[var(--p-border)] group-hover:bg-[var(--p-primary)] rounded-r-md transition-colors duration-300" />
            
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="theme-card absolute top-5 sm:top-6 right-5 sm:right-6 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold bg-[var(--p-bg-secondary)] border border-[var(--p-border)] text-[var(--p-fg)] hover:text-[var(--p-primary)] hover:border-[var(--p-primary)] transition-all duration-300 shadow-sm z-10"
              >
                <Globe className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Project</span><span className="sm:hidden">View</span>
              </a>
            )}

            <h3 className="text-xl sm:text-2xl font-bold text-[var(--p-fg)] mb-3 group-hover:text-[var(--p-primary)] transition-colors pr-20 sm:pr-32">
              {project.title || "Untitled Project"}
            </h3>
            <p className="text-[var(--p-fg-muted)] text-sm leading-relaxed mb-0 whitespace-pre-wrap">
              {project.description || "Project description will appear here."}
            </p>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="py-12 rounded-2xl border border-dashed border-[var(--p-border)] text-center text-[var(--p-fg-muted)]">
            Add projects in the editor to see them here.
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─── EDUCATION ─── */
const SidebarEducation = ({ data }: { data: EducationContent }) => {
  const items = (data.items || []).filter((edu: any) => edu.isVisible !== false);
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-8"
    >
      <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-[var(--p-fg)] tracking-tight mb-10">
        Education
      </motion.h2>
      <div className="space-y-0 relative ml-3">
        {items.map((edu: any, i: number) => (
          <motion.div key={i} variants={fadeInUp} className="relative pb-10 last:pb-0 group pl-8 sm:pl-10">
            {i < items.length - 1 && (
              <div className="absolute bg-[var(--p-border)] transition-colors duration-500" style={{ top: '12px', bottom: '-12px', left: '0', width: 'var(--p-border-width, 1px)', transform: 'translateX(-50%)' }} />
            )}
            <div className="theme-dot absolute left-0 top-1.5 w-3 h-3 bg-[var(--p-bg-secondary)] border-[var(--p-border)] group-hover:border-[var(--p-primary)] group-hover:bg-[var(--p-primary)] transition-colors shadow-[0_0_0_4px_var(--p-bg)] z-10" style={{ transform: 'translateX(-50%)' }} />

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
              <h3 className="text-lg font-bold text-[var(--p-fg)]">{edu.degree || "Degree"}</h3>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--p-primary)] bg-[var(--p-primary)]/10 px-3 py-1 rounded-full w-fit">
                {edu.year || "Year"}
              </span>
            </div>
            <p className="text-sm font-medium text-[var(--p-fg)]/70 mb-1">{edu.school || "School"}</p>
            {edu.grade && (
              <p className="text-sm font-semibold text-[var(--p-primary)] mt-1">Grade: {edu.grade}</p>
            )}
          </motion.div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[var(--p-fg-muted)] italic">No education entries yet.</p>
        )}
      </div>
    </motion.div>
  );
};

/* ─── TESTIMONIALS ─── */
const SidebarTestimonials = ({ data }: { data: TestimonialsContent }) => (
  <motion.div
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    variants={staggerContainer}
    className="w-full py-8"
  >
    <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-[var(--p-fg)] tracking-tight mb-10">
      Recommendations
    </motion.h2>
    <div className="grid grid-cols-1 gap-6">
      {(data.items || []).map((testimonial: any, i: number) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          className="theme-card p-6 sm:p-8 bg-[var(--p-bg-secondary)] relative group hover:border-[var(--p-primary)] transition-all duration-300"
        >
          <Quote className="absolute top-6 right-6 w-6 h-6 text-[var(--p-primary)] opacity-20 group-hover:opacity-60 transition-opacity" />
          <p className="text-[var(--p-fg-muted)] leading-relaxed mb-6 italic text-sm relative z-10">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div>
            <div className="font-bold text-[var(--p-fg)] text-sm">{testimonial.author}</div>
            {testimonial.role && <div className="text-xs font-medium text-[var(--p-primary)] mt-0.5">{testimonial.role}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

/* ─── CONTACT FORM ─── */
const SidebarContactForm = ({ data }: { data: ContactFormContent }) => {
  const email = data.emailTarget || "hello@example.com";
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-8"
    >
      <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-[var(--p-fg)] tracking-tight mb-4">
        {data.title || "Let's work together."}
      </motion.h2>
      <motion.p variants={fadeInUp} className="text-[var(--p-fg-muted)] mb-8 leading-relaxed max-w-lg">
        {data.description || "I'm currently open for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!"}
      </motion.p>
      <motion.a
        variants={fadeInUp}
        href={`mailto:${email}`}
        className="theme-pill w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-[var(--p-fg)] border border-[var(--p-border)] shadow-[var(--p-shadow)] hover:shadow-[var(--p-shadow-hover)] hover:-translate-y-1 hover:-translate-x-1 transition-all group/mail"
      >
        <Send className="w-4 h-4 group-hover/mail:translate-x-1 group-hover/mail:-translate-y-1 transition-transform" /> {data.buttonText || "Get in Touch"}
      </motion.a>
    </motion.div>
  );
};

export const SidebarBlockMap: Record<string, React.FC<any>> = {
  HERO: SidebarHero,
  SKILLS: SidebarSkills,
  EXPERIENCE: SidebarExperience,
  PROJECTS: SidebarProjects,
  EDUCATION: SidebarEducation,
  TESTIMONIALS: SidebarTestimonials,
  CONTACT_FORM: SidebarContactForm,
};
