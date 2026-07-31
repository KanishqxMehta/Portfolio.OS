"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const { sections, updateBlockData, addBlock } = usePortfolioStore();

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
    // HERO
    const heroSection = sections.find(s => s.type === "HERO");
    if (heroSection) {
      updateBlockData(heroSection.id, {
        fullName: data.name || heroSection.content.fullName,
        bio: data.bio || heroSection.content.bio || "Passionate professional with experience in software development.",
        github: data.github || heroSection.content.github || "",
        linkedin: data.linkedin || heroSection.content.linkedin || "",
      });
    } else {
      addBlock("HERO", "About Me");
      setTimeout(() => {
        const newHero = usePortfolioStore.getState().sections.find(s => s.type === "HERO");
        if (newHero) {
          updateBlockData(newHero.id, { 
            fullName: data.name || "", 
            bio: data.bio || "Passionate professional...",
            github: data.github || "",
            linkedin: data.linkedin || ""
          });
        }
      }, 0);
    }

    // SKILLS
    const skillsSection = sections.find(s => s.type === "SKILLS");
    if (skillsSection) {
      const existing = skillsSection.content.items || [];
      const newItems = (data.skills || []).filter((s: string) => !existing.some((es: string) => es.toLowerCase() === s.toLowerCase()));
      updateBlockData(skillsSection.id, {
        items: [...existing, ...newItems]
      });
    } else if (data.skills && data.skills.length > 0) {
      addBlock("SKILLS", "Skills");
      setTimeout(() => {
        const newSkills = usePortfolioStore.getState().sections.find(s => s.type === "SKILLS");
        if (newSkills) {
          updateBlockData(newSkills.id, { items: data.skills });
        }
      }, 0);
    }

    // EDUCATION
    const eduSection = sections.find(s => s.type === "EDUCATION");
    if (eduSection) {
      const existing = eduSection.content.items || [];
      const updatedItems = existing.map((eItem: any) => {
        const matching = (data.education || []).find((newEd: any) => 
          newEd.school && eItem.school && newEd.school.toLowerCase().trim() === eItem.school.toLowerCase().trim()
        );
        if (matching) {
          const merged = { ...eItem };
          if (matching.school) merged.school = matching.school;
          if (matching.degree) merged.degree = matching.degree;
          if (matching.year) merged.year = matching.year;
          if (matching.grade) merged.grade = matching.grade;
          return { ...merged, id: eItem.id, isVisible: eItem.isVisible };
        }
        return eItem;
      });
      const trulyNewItems = (data.education || []).filter((newEd: any) => !existing.some((e: any) => e.school && newEd.school && e.school.toLowerCase().trim() === newEd.school.toLowerCase().trim()));
      updateBlockData(eduSection.id, {
        items: [...updatedItems, ...trulyNewItems].map((item: any) => ({ ...item, id: item.id || crypto.randomUUID(), isVisible: item.isVisible !== false }))
      });
    } else if (data.education && data.education.length > 0) {
      const validEdu = data.education.map((item: any) => ({ ...item, id: crypto.randomUUID(), isVisible: true }));
      addBlock("EDUCATION", "Education");
      setTimeout(() => {
        const newEdu = usePortfolioStore.getState().sections.find(s => s.type === "EDUCATION");
        if (newEdu) {
          updateBlockData(newEdu.id, { items: validEdu });
        }
      }, 0);
    }

    // EXPERIENCE
    const expSection = sections.find(s => s.type === "EXPERIENCE");
    if (expSection) {
      const existing = expSection.content.items || [];
      const updatedItems = existing.map((exItem: any) => {
        const matching = (data.experience || []).find((newEx: any) => 
          newEx.company && exItem.company && newEx.company.toLowerCase().trim() === exItem.company.toLowerCase().trim()
        );
        if (matching) {
          const merged = { ...exItem };
          if (matching.company) merged.company = matching.company;
          if (matching.role) merged.role = matching.role;
          if (matching.years) merged.years = matching.years;
          if (matching.description) merged.description = matching.description;
          return { ...merged, id: exItem.id, isVisible: exItem.isVisible };
        }
        return exItem;
      });
      const trulyNewItems = (data.experience || []).filter((newEx: any) => !existing.some((e: any) => e.company && newEx.company && e.company.toLowerCase().trim() === newEx.company.toLowerCase().trim()));
      updateBlockData(expSection.id, {
        items: [...updatedItems, ...trulyNewItems].map((item: any) => ({ ...item, id: item.id || crypto.randomUUID(), isVisible: item.isVisible !== false }))
      });
    } else if (data.experience && data.experience.length > 0) {
      const validExp = data.experience.map((item: any) => ({ ...item, id: item.id || crypto.randomUUID(), isVisible: item.isVisible !== false }));
      addBlock("EXPERIENCE", "Experience");
      setTimeout(() => {
        const newExp = usePortfolioStore.getState().sections.find(s => s.type === "EXPERIENCE");
        if (newExp) {
          updateBlockData(newExp.id, { items: validExp });
        }
      }, 0);
    }

    // PROJECTS
    const projectsSection = sections.find(s => s.type === "PROJECTS");
    if (projectsSection) {
      const existing = projectsSection.content.items || [];
      const updatedItems = existing.map((pItem: any) => {
        const matching = (data.projects || []).find((newProj: any) => 
          newProj.title && pItem.title && newProj.title.toLowerCase().trim() === pItem.title.toLowerCase().trim()
        );
        if (matching) {
          const merged = { ...pItem };
          if (matching.title) merged.title = matching.title;
          if (matching.description) merged.description = matching.description;
          if (matching.link) merged.link = matching.link;
          return { ...merged, id: pItem.id, isVisible: pItem.isVisible };
        }
        return pItem;
      });
      const trulyNewItems = (data.projects || []).filter((newProj: any) => !existing.some((p: any) => p.title && newProj.title && p.title.toLowerCase().trim() === newProj.title.toLowerCase().trim()));
      updateBlockData(projectsSection.id, {
        items: [...updatedItems, ...trulyNewItems].map((item: any) => ({ ...item, id: item.id || crypto.randomUUID(), isVisible: item.isVisible !== false }))
      });
    } else if (data.projects && data.projects.length > 0) {
      const validProjects = data.projects.map((item: any) => ({ ...item, id: item.id || crypto.randomUUID(), isVisible: item.isVisible !== false }));
      addBlock("PROJECTS", "Projects");
      setTimeout(() => {
        const newProj = usePortfolioStore.getState().sections.find(s => s.type === "PROJECTS");
        if (newProj) {
          updateBlockData(newProj.id, { items: validProjects });
        }
      }, 0);
    }

    // CONTACT FORM
    const contactSection = sections.find(s => s.type === "CONTACT_FORM");
    if (contactSection && data.email) {
      updateBlockData(contactSection.id, {
        emailTarget: data.email || contactSection.content.emailTarget,
      });
    } else if (data.email) {
      addBlock("CONTACT_FORM", "Contact Me");
      setTimeout(() => {
        const newContact = usePortfolioStore.getState().sections.find(s => s.type === "CONTACT_FORM");
        if (newContact) {
          updateBlockData(newContact.id, { emailTarget: data.email, buttonText: "Send Message", title: "Get In Touch", description: "Feel free to reach out to me directly." });
        }
      }, 0);
    }

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
