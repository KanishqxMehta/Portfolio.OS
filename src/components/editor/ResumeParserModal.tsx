"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/Loader";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Wand2, FileText, CheckCircle2 } from "lucide-react";
import { usePortfolioStore } from "@/store/usePortfolioStore";

// Removed top-level PDF.js worker setup


interface ResumeParserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeParserModal({ isOpen, onOpenChange }: ResumeParserModalProps) {
  const [parsingState, setParsingState] = useState<"idle" | "reading" | "extracting" | "populating" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sections, setProposedSections } = usePortfolioStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid PDF file.");
      setParsingState("error");
      return;
    }

    try {
      setParsingState("reading");

      // Dynamically import pdf.js to prevent SSR DOMMatrix errors
      const pdfjsLib = await import("pdfjs-dist");

      // Set PDF.js worker before processing
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      
      const arrayBuffer = await file.arrayBuffer();
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        
        // Extract embedded hyperlinks
        const annotations = await page.getAnnotations();
        const urls = annotations
          .filter((a: any) => a.subtype === 'Link' && a.url)
          .map((a: any) => a.url);

        fullText += pageText + " ";
        if (urls.length > 0) {
          fullText += `\n[Embedded Links: ${urls.join(", ")}]\n`;
        }
      }

      setParsingState("extracting");
      
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse with AI");
      }

      const { data: parsedData } = await response.json();

      setParsingState("populating");

      applyParsedData(parsedData);

      setParsingState("success");
      setTimeout(() => {
        onOpenChange(false);
        setParsingState("idle");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to parse the PDF.");
      setParsingState("error");
    }
  };

  const applyParsedData = (data: any) => {
    const draftSections: any[] = JSON.parse(JSON.stringify(sections));

    // HERO
    const heroIdx = draftSections.findIndex((s) => s.type === 'HERO');
    if (heroIdx !== -1) {
      draftSections[heroIdx].content = {
        ...draftSections[heroIdx].content,
        fullName: data.name || draftSections[heroIdx].content.fullName,
        bio: data.bio || draftSections[heroIdx].content.bio || 'Passionate professional',
        github: data.github || draftSections[heroIdx].content.github || '',
        linkedin: data.linkedin || draftSections[heroIdx].content.linkedin || '',
      };
    } else {
      draftSections.unshift({
        id: crypto.randomUUID(),
        type: 'HERO',
        title: 'About Me',
        content: {
          fullName: data.name || '',
          bio: data.bio || 'Passionate professional',
          github: data.github || '',
          linkedin: data.linkedin || '',
        },
        isVisible: true,
      });
    }

    // SKILLS
    if (data.skills && data.skills.length > 0) {
      const skillsIdx = draftSections.findIndex((s) => s.type === 'SKILLS');
      if (skillsIdx !== -1) {
        const existing = draftSections[skillsIdx].content.items || [];
        const newItems = data.skills.filter((s: string) => !existing.some((es: string) => es.toLowerCase().trim() === s.toLowerCase().trim()));
        draftSections[skillsIdx].content = {
          ...draftSections[skillsIdx].content,
          items: [...existing, ...newItems],
        };
      } else {
        draftSections.push({
          id: crypto.randomUUID(),
          type: 'SKILLS',
          title: 'Skills',
          content: { items: data.skills },
          isVisible: true,
        });
      }
    }

    // EDUCATION
    if (data.education && data.education.length > 0) {
      const eduIdx = draftSections.findIndex((s) => s.type === 'EDUCATION');
      const validEdu = data.education.map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        isVisible: item.isVisible !== false,
      }));
      if (eduIdx !== -1) {
        const existing = draftSections[eduIdx].content.items || [];
        const updatedItems = existing.map((eItem: any) => {
          const matching = validEdu.find((newEd: any) => 
            newEd.school && eItem.school && newEd.school.toLowerCase().trim() === eItem.school.toLowerCase().trim()
          );
          return matching ? { ...eItem, ...matching } : eItem;
        });
        const trulyNew = validEdu.filter((newEd: any) => !existing.some((e: any) => e.school && newEd.school && e.school.toLowerCase().trim() === newEd.school.toLowerCase().trim()));
        draftSections[eduIdx].content = {
          ...draftSections[eduIdx].content,
          items: [...updatedItems, ...trulyNew],
        };
      } else {
        draftSections.push({
          id: crypto.randomUUID(),
          type: 'EDUCATION',
          title: 'Education',
          content: { items: validEdu },
          isVisible: true,
        });
      }
    }

    // EXPERIENCE
    if (data.experience && data.experience.length > 0) {
      const expIdx = draftSections.findIndex((s) => s.type === 'EXPERIENCE');
      const validExp = data.experience.map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        isVisible: item.isVisible !== false,
      }));
      if (expIdx !== -1) {
        const existing = draftSections[expIdx].content.items || [];
        const updatedItems = existing.map((exItem: any) => {
          const matching = validExp.find((newEx: any) => 
            newEx.company && exItem.company && newEx.company.toLowerCase().trim() === exItem.company.toLowerCase().trim()
          );
          return matching ? { ...exItem, ...matching } : exItem;
        });
        const trulyNew = validExp.filter((newEx: any) => !existing.some((e: any) => e.company && newEx.company && e.company.toLowerCase().trim() === newEx.company.toLowerCase().trim()));
        draftSections[expIdx].content = {
          ...draftSections[expIdx].content,
          items: [...updatedItems, ...trulyNew],
        };
      } else {
        draftSections.push({
          id: crypto.randomUUID(),
          type: 'EXPERIENCE',
          title: 'Experience',
          content: { items: validExp },
          isVisible: true,
        });
      }
    }

    // PROJECTS
    if (data.projects && data.projects.length > 0) {
      const projIdx = draftSections.findIndex((s) => s.type === 'PROJECTS');
      const validProjects = data.projects.map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        isVisible: item.isVisible !== false,
      }));
      if (projIdx !== -1) {
        const existing = draftSections[projIdx].content.items || [];
        const updatedItems = existing.map((pItem: any) => {
          const matching = validProjects.find((newProj: any) => 
            newProj.title && pItem.title && newProj.title.toLowerCase().trim() === pItem.title.toLowerCase().trim()
          );
          return matching ? { ...pItem, ...matching } : pItem;
        });
        const trulyNew = validProjects.filter((newProj: any) => !existing.some((p: any) => p.title && newProj.title && p.title.toLowerCase().trim() === newProj.title.toLowerCase().trim()));
        draftSections[projIdx].content = {
          ...draftSections[projIdx].content,
          items: [...updatedItems, ...trulyNew],
        };
      } else {
        draftSections.push({
          id: crypto.randomUUID(),
          type: 'PROJECTS',
          title: 'Projects',
          content: { items: validProjects },
          isVisible: true,
        });
      }
    }

    setProposedSections(draftSections);
  };

  const getLoaderText = () => {
    switch (parsingState) {
      case "reading": return "Reading resume file...";
      case "extracting": return "Extracting details...";
      case "populating": return "Populating portfolio sections...";
      default: return "Loading...";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (parsingState === "idle" || parsingState === "error" || parsingState === "success") {
        onOpenChange(val);
        if (!val) {
          setTimeout(() => setParsingState("idle"), 300);
        }
      }
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        
        {(parsingState === "reading" || parsingState === "extracting" || parsingState === "populating") ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
            <Loader text={getLoaderText()} size="lg" />
          </div>
        ) : parsingState === "success" ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[400px] text-center px-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Resume Parsed Successfully!</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Your portfolio sections have been updated with the extracted details.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">AI Resume Parser</DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                      Instantly build your portfolio by uploading your resume.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Active */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:border-violet-400 dark:hover:border-violet-500/50 transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Upload PDF Resume</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Extracts Name, Skills, & Experience automatically</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {/* Option 2: Coming Soon */}
              <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-70 pointer-events-none text-center overflow-hidden">
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Coming Soon
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Generate AI Template</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Create a highly customized layout based on your role</p>
              </div>
            </div>

            {parsingState === "error" && (
              <div className="px-6 pb-6">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm text-center border border-red-100 dark:border-red-900/30">
                  {errorMsg}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
