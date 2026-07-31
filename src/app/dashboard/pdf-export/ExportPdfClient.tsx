"use client";

import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Section } from "@/lib/validations/portfolio";

export function ExportPdfClient({ sections }: { sections: Section[] }) {
  useEffect(() => {
    // Automatically trigger print dialog on mount
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const hero = sections.find((s) => s.type === "HERO")?.content;
  const experience = sections.find((s) => s.type === "EXPERIENCE")?.content?.items || [];
  const projects = sections.find((s) => s.type === "PROJECTS")?.content?.items || [];
  const education = sections.find((s) => s.type === "EDUCATION")?.content?.items || [];
  const skills = sections.find((s) => s.type === "SKILLS")?.content?.items || [];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      {/* Non-printable UI header */}
      <div className="no-print p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between print:hidden">
        <Link href="/dashboard/edit" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Resume
        </button>
      </div>

      {/* Printable Resume Canvas */}
      <div className="max-w-[800px] mx-auto p-8 md:p-12 print:p-0 print:max-w-full">
        {/* Header */}
        {hero && (
          <header className="mb-8 border-b-2 border-gray-900 pb-4">
            <h1 className="text-4xl font-bold mb-2">{hero.fullName}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-medium">
              {hero.phone && (
                <span className="text-gray-600">{hero.phone}</span>
              )}
              {hero.github && (
                <a href={hero.github} className="text-gray-600 hover:text-black hover:underline transition-colors">
                  GitHub
                </a>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin} className="text-gray-600 hover:text-black hover:underline transition-colors">
                  LinkedIn
                </a>
              )}
            </div>
            {hero.bio && <p className="mt-4 text-sm leading-relaxed max-w-3xl">{hero.bio}</p>}
          </header>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Experience</h3>
            <div className="space-y-6">
              {experience.filter((item: any) => item.isVisible !== false).map((item: any, idx: number) => (
                <div key={idx} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900">{item.role}</h4>
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{item.years}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-2">{item.company}</div>
                  {item.description && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Projects</h3>
            <div className="space-y-5">
              {projects.filter((item: any) => item.isVisible !== false).map((item: any, idx: number) => (
                <div key={idx} className="break-inside-avoid">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">
                      {item.link ? (
                        <a href={item.link} className="text-black no-underline hover:underline">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </h4>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="text-xs font-medium text-gray-500 mt-1">Tech: {item.tags.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Education</h3>
            <div className="space-y-4">
              {education.filter((item: any) => item.isVisible !== false).map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900">{item.degree}</h4>
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{item.year}</span>
                  </div>
                  <div className="text-sm text-gray-700">{item.school}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="break-inside-avoid">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">Technical Skills</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
              {skills.map((skill: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  {typeof skill === "string" ? (
                    <span className="font-medium">{skill}</span>
                  ) : (
                    <>
                      <span className="font-bold">{skill.category}:</span>
                      <span>{skill.items?.join(", ")}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
          }
          /* Ensure backgrounds are printed if necessary (usually disabled for clean text resumes, but helpful for subtle borders) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
