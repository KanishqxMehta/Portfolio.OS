"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PortfolioRenderer } from "@/components/portfolio/Renderer";
import { BlockEditor } from "../BlockEditor";
import { ThemePicker } from "./ThemePicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ExternalLink,
  CheckCircle2,
  Copy,
  ChevronUp,
  ChevronDown,
  Trash2,
  Layers,
  Globe,
  LogOut,
  LayoutDashboard,
  Check,
  UserCircle,
  Eye,
  EyeOff,
  Edit3,
  Sun,
  Moon,
  TrendingUp,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const BLOCK_TYPES = [
  { type: "HERO", label: "Hero", description: "Name & bio" },
  { type: "SKILLS", label: "Skills", description: "List of tech" },
  { type: "EXPERIENCE", label: "Experience", description: "Work history" },
  { type: "PROJECTS", label: "Projects", description: "Your portfolio" },
  { type: "EDUCATION", label: "Education", description: "Degrees & certs" },
  // { type: "TESTIMONIALS", label: "Testimonials", description: "Quotes from peers" },
  { type: "CONTACT_FORM", label: "Contact Form", description: "Email you directly" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  HERO: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900/40",
  PROJECTS: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900/40",
  SKILLS: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
  EXPERIENCE: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
  EDUCATION: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
  CONTACT_FORM: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
};

function BlockUI({
  section,
  index,
  hoveredId,
  setHoveredId,
  sections,
  dragHandleProps,
  setNodeRef,
  style,
  isDraggingOverlay = false,
}: any) {
  const { removeBlock, moveBlock, toggleBlockVisibility } = usePortfolioStore();

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHoveredId(section.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={cn(
        "rounded-xl border transition-colors duration-200",
        hoveredId === section.id
          ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60"
          : "border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30",
        isDraggingOverlay && "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl"
      )}
    >
      {/* Block header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          {dragHandleProps && (
            <button
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 transition-colors -ml-1.5 touch-none"
              tabIndex={-1}
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
              TYPE_COLORS[section.type] ??
                "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600"
            )}
          >
            {section.type}
          </span>
          <span className="text-[10px] text-zinc-400">
            #{index + 1}
          </span>
        </div>

        <div
          className={cn(
            "flex items-center gap-0.5 transition-opacity",
            hoveredId === section.id ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Visibility toggle */}
          {section.type !== "HERO" && (
            <button
              onClick={() => toggleBlockVisibility(section.id)}
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center transition-colors",
                section.isVisible
                  ? "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  : "text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500"
              )}
              title={section.isVisible ? "Hide from preview" : "Show in preview"}
            >
              {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}
          {section.type !== "HERO" && section.type !== "CONTACT_FORM" && (
            <>
              <button
                onClick={() => {
                  const isFirst = index === 0 || (index === 1 && sections[0].type === "HERO");
                  if (!isFirst) moveBlock(section.id, "up");
                }}
                disabled={index === 0 || (index === 1 && sections[0].type === "HERO")}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center transition-colors",
                  (index === 0 || (index === 1 && sections[0].type === "HERO"))
                    ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed opacity-30"
                    : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                )}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const isLast = index === sections.length - 1 || (index === sections.length - 2 && sections[sections.length - 1].type === "CONTACT_FORM");
                  if (!isLast) moveBlock(section.id, "down");
                }}
                disabled={index === sections.length - 1 || (index === sections.length - 2 && sections[sections.length - 1].type === "CONTACT_FORM")}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center transition-colors",
                  (index === sections.length - 1 || (index === sections.length - 2 && sections[sections.length - 1].type === "CONTACT_FORM"))
                    ? "text-zinc-300 dark:text-zinc-800 cursor-not-allowed opacity-30"
                    : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                )}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {section.type !== "HERO" && (
            <button
              onClick={() => removeBlock(section.id)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Block content — dim if hidden */}
      {!isDraggingOverlay && (
        <div className={cn("px-4 pb-4", !section.isVisible && "opacity-40")}>
          {section.isVisible ? (
            <BlockEditor block={section} />
          ) : (
            <p className="text-[11px] text-zinc-500 italic">Block is hidden from preview. Toggle the eye icon to show it.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SortableBlock({ section, index, hoveredId, setHoveredId, sections }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <BlockUI
      section={section}
      index={index}
      hoveredId={hoveredId}
      setHoveredId={setHoveredId}
      sections={sections}
      dragHandleProps={{ attributes, listeners }}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
}

function FixedBlock({ section, index, hoveredId, setHoveredId, sections }: any) {
  return (
    <BlockUI
      section={section}
      index={index}
      hoveredId={hoveredId}
      setHoveredId={setHoveredId}
      sections={sections}
    />
  );
}

export default function EditPortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme: activeMode, setTheme: setActiveMode } = useTheme();
  const [activeSidebarTab, setActiveSidebarTab] = useState<"content" | "design">("content");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const {
    sections,
    theme,
    addBlock,
    username,
    setUsername,
    savePortfolio,
    isSaving,
    isLoading,
    loadPortfolio,
    moveBlock,
    removeBlock,
    reorderBlocks,
    toggleBlockVisibility,
  } = usePortfolioStore();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadRef = useRef(true);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  const sortableIds = sections
    .filter((s) => s.type !== "HERO" && s.type !== "CONTACT_FORM")
    .map((s) => s.id);

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderBlocks(active.id as string, over.id as string);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Auth redirection is handled by middleware.ts, client side only loads when authenticated.

  useEffect(() => {
    if (status === "authenticated") {
      const sessionUsername = (session?.user as any)?.username;
      if (sessionUsername && !username) {
        setUsername(sessionUsername);
      }
      loadPortfolio();
    }
  }, [status]);

  // Monitor changes to sections or theme to mark form as dirty
  useEffect(() => {
    if (isLoading) {
      initialLoadRef.current = true;
      setIsDirty(false);
      return;
    }

    // If we finished loading, ignore the first state sync
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    setIsDirty(true);
  }, [sections, theme, isLoading]);

  // Prevent browser closing / reloading when page is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSave = async () => {
    const success = await savePortfolio();
    if (success) {
      setIsSuccessOpen(true);
      setIsDirty(false);
    }
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL}p/${username}`;

  return (
    <div className="h-[100dvh] bg-white dark:bg-zinc-950 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100 transition-colors duration-500 overflow-hidden">
      {/* Shared Responsive Header */}
      <DashboardHeader
        currentPage="editor"
        publicSlug={username}
        isSaving={isSaving}
        isDirty={isDirty}
        onSave={handleSave}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-sm z-[100] flex items-center justify-center transition-opacity">
            <Loader text="Loading portfolio..." />
          </div>
        )}
        {/* Left Sidebar */}
        <aside className={cn("w-full md:w-[360px] border-r border-zinc-200 dark:border-zinc-900 flex flex-col bg-zinc-50/80 dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-30 shadow-lg dark:shadow-2xl dark:shadow-black/40 transition-colors duration-500", mobileView === "edit" ? "flex" : "hidden md:flex")}>
          {/* Sidebar header */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-500">
            <button
              onClick={() => setActiveSidebarTab("content")}
              className={cn(
                "flex-1 py-4 text-[11px] font-semibold uppercase tracking-widest border-b-2 transition-colors",
                activeSidebarTab === "content" ? "border-violet-500 text-violet-600 dark:text-violet-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-400"
              )}
            >
              Content Blocks
            </button>
            <button
              onClick={() => setActiveSidebarTab("design")}
              className={cn(
                "flex-1 py-4 text-[11px] font-semibold uppercase tracking-widest border-b-2 transition-colors",
                activeSidebarTab === "design" ? "border-violet-500 text-violet-600 dark:text-violet-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-400"
              )}
            >
              Theme & Design
            </button>
          </div>

          {activeSidebarTab === "design" ? (
            <div className="flex-1 overflow-y-auto p-4" data-lenis-prevent>
              <ThemePicker />
            </div>
          ) : (
            <>
              {/* Blocks list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" data-lenis-prevent>
                {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300 animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                </div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Start with your first draft!</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 px-4 leading-relaxed">
                  Add a Hero block below to begin customizing your professional story.
                </p>
              </div>
            ) : null}

            {sections.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="flex flex-col gap-2">
                  {/* Fixed HERO block at the top */}
                  {sections.find(s => s.type === "HERO") && (
                    <FixedBlock
                      section={sections.find(s => s.type === "HERO")!}
                      index={sections.findIndex(s => s.type === "HERO")}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      sections={sections}
                    />
                  )}

                  {/* Sortable blocks in the middle */}
                  <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    {sections.filter(s => s.type !== "HERO" && s.type !== "CONTACT_FORM").map((section) => (
                      <SortableBlock
                        key={section.id}
                        section={section}
                        index={sections.findIndex(s => s.id === section.id)}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                        sections={sections}
                      />
                    ))}
                  </SortableContext>

                  {/* Fixed CONTACT_FORM block at the bottom */}
                  {sections.find(s => s.type === "CONTACT_FORM") && (
                    <FixedBlock
                      section={sections.find(s => s.type === "CONTACT_FORM")!}
                      index={sections.findIndex(s => s.type === "CONTACT_FORM")}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      sections={sections}
                    />
                  )}
                </div>

                {typeof window !== "undefined" && createPortal(
                  <DragOverlay adjustScale={false}>
                    {activeId ? (
                      <div className="w-[calc(100vw-32px)] md:w-[328px] pointer-events-none select-none">
                        <BlockUI
                          section={sections.find((s: any) => s.id === activeId)!}
                          index={sections.findIndex((s: any) => s.id === activeId)}
                          hoveredId={null}
                          setHoveredId={() => {}}
                          sections={sections}
                          dragHandleProps={{ attributes: {}, listeners: {} }}
                          isDraggingOverlay={true}
                          style={{
                            transform: "rotate(1.5deg) scale(1.02)",
                            boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -5px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      </div>
                    ) : null}
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>
            )}
          </div>

          {/* Add block panel */}
          {!activeId && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Add Block
                </p>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {sections.length}/{BLOCK_TYPES.length} Active
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map(({ type, label }) => {
                  const isAdded = sections.some((s) => s.type === type);
                  return (
                    <button
                      key={type}
                      onClick={() => !isAdded && addBlock(type, label)}
                      disabled={isAdded}
                      className={cn(
                        "group flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all whitespace-nowrap",
                        isAdded
                          ? "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-300 dark:hover:border-violet-500/30 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer shadow-sm hover:shadow"
                      )}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500/50" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-violet-500 group-hover:scale-110 transition-transform" />
                      )}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
            </>
          )}
        </aside>

        {/* Preview pane */}
        <main className={cn("flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center py-6 md:py-10 px-4 md:px-8 transition-colors duration-500", mobileView === "preview" ? "flex" : "hidden md:flex")} data-lenis-prevent>
          {/* Preview Container Wrapper */}
          <div className="max-w-[1000px] mx-auto w-full">
            {/* macOS window chrome */}
            <div className="rounded-t-2xl bg-zinc-200 dark:bg-zinc-900 border-x border-t border-zinc-300 dark:border-zinc-800 flex items-center px-4 h-10 gap-2 transition-colors duration-500">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              <div className="mx-auto bg-zinc-300/50 dark:bg-zinc-950 px-3 py-1 rounded text-[10px] text-zinc-500 dark:text-zinc-500 font-mono flex-1 max-w-[300px] text-center ml-4 border border-zinc-300 dark:border-zinc-800 shadow-inner transition-colors duration-500 truncate">
                {publicUrl}
              </div>
            </div>

            {/* Preview content */}
            <div className="border border-zinc-300 dark:border-zinc-800 rounded-b-2xl overflow-hidden bg-white dark:bg-black shadow-2xl shadow-black/10 dark:shadow-black/60 relative min-h-[600px] transition-colors duration-500">
              <PortfolioRenderer sections={sections} theme={theme} />

              {sections.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                    <Layers className="w-7 h-7 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <p className="text-base font-semibold text-zinc-400">
                    Your portfolio is empty
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Add blocks from the left panel
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Success dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl pt-10">
          <DialogHeader className="flex flex-col items-center space-y-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Portfolio Published
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
              Your portfolio is live and ready to share.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 p-3 rounded-xl mt-2 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
                Public URL
              </p>
              <p className="text-sm font-mono text-zinc-600 dark:text-zinc-300 truncate break-all">
                {publicUrl}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-xl font-medium cursor-pointer">
                View Live Site <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={() => setIsSuccessOpen(false)}
              className="w-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              Back to Editor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile view toggle floating button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <button
          onClick={() => setMobileView(mobileView === "edit" ? "preview" : "edit")}
          className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all border border-zinc-800 dark:border-zinc-200/85 cursor-pointer"
        >
          {mobileView === "edit" ? (
            <>
              <Eye className="w-4 h-4 shrink-0" />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 shrink-0" />
              <span>Edit Blocks</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}