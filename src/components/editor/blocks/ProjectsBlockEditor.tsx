"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, EyeOff, GripVertical, Sparkles, Star } from "lucide-react";
import { Section, PublicMediaUrlSchema } from "@/lib/validations/portfolio";
import { CASE_STUDY_FIELDS, hasCaseStudyContent } from "@/lib/project-collection";
import { MAX_PROJECT_IMAGE_BYTES, PROJECT_IMAGE_TYPES } from "@/lib/project-media";
import { ProjectImage } from "@/components/portfolio/ProjectImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { useToastStore } from "@/store/useToastStore";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

function ProjectItemUI({
  item,
  idx,
  items,
  updateProject,
  handleUpdate,
  fieldClass,
  isValidUrl,
  dragHandleProps,
  uploadScreenshot,
}: any) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const screenshots: Array<{ url: string; thumbnailUrl?: string; caption?: string }> = item.screenshots ?? [];
  const caseStudyEnabled: boolean = item.caseStudyEnabled ?? hasCaseStudyContent(item);
  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/proj transition-colors relative",
        !item.isVisible && "opacity-50 grayscale"
      )}
    >
      {isEnhancing && (
        <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-lg">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">Enhancing...</span>
        </div>
      )}
      <div
        {...dragHandleProps}
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing opacity-0 group-hover/proj:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          Project {idx + 1}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover/proj:opacity-100 transition-all">
          <button
            type="button"
            aria-label={item.featured ? "Remove from featured projects" : "Feature this project"}
            title={item.featured ? "Remove from featured projects" : "Feature this project"}
            onClick={() => updateProject && updateProject(idx, { featured: !item.featured })}
            className={cn(
              "w-5 h-5 flex items-center justify-center transition-colors",
              item.featured
                ? "text-amber-500 hover:text-amber-600"
                : "text-zinc-400 hover:text-amber-500",
            )}
          >
            <Star className="w-3 h-3" fill={item.featured ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => updateProject && updateProject(idx, { isVisible: !item.isVisible })}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
          >
            {item.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            onClick={() =>
              handleUpdate && handleUpdate({ items: items.filter((_: any, i: number) => i !== idx) })
            }
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <Input
        placeholder="Project title"
        value={item.title}
        onChange={(e) => updateProject && updateProject(idx, { title: e.target.value })}
        className={cn(
          fieldClass,
          !item.title && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
        )}
      />

      <div className="grid grid-cols-[1fr_6rem] gap-2">
        <Input
          aria-label="Project tags"
          placeholder="Tags: React, AI, Backend"
          defaultValue={(item.tags || []).join(", ")}
          onBlur={(e) => updateProject && updateProject(idx, {
            tags: [...new Set(e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20),
          })}
          className={fieldClass}
        />
        <Input
          aria-label="Project year"
          placeholder="Year"
          maxLength={4}
          inputMode="numeric"
          value={item.year || ""}
          onChange={(e) => updateProject && updateProject(idx, { year: e.target.value.replace(/\D/g, "") })}
          className={fieldClass}
        />
      </div>

      <div className="relative">
        <Textarea
          placeholder="Short description of what you built and tech used..."
          value={item.description}
          onChange={(e) => updateProject && updateProject(idx, { description: e.target.value })}
          className={cn(
            fieldClass,
            "min-h-[60px] h-auto resize-none pb-8",
            !item.description && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
          )}
        />
        <button
          onClick={async () => {
            if (!updateProject || !item.description) return;
            try {
              setIsEnhancing(true);
              const res = await fetch('/api/enhance-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: item.description, type: 'project' })
              });
              if (!res.ok) {
                const errorData = await res.json().catch(() => null) as { error?: string } | null;
                throw new Error(errorData?.error || 'Enhance failed');
              }
              const data = await res.json();
              if (data.enhancedText) {
                updateProject(idx, { description: data.enhancedText });
              }
            } catch (error) {
              useToastStore.getState().toast(
                error instanceof Error ? error.message : 'Unable to enhance text right now.',
                'error',
                5000
              );
            } finally {
              setIsEnhancing(false);
              window.dispatchEvent(new Event("ai-usage-updated"));
            }
          }}
          disabled={!item.description || isEnhancing}
          title="Enhance with AI"
          className="absolute bottom-1.5 right-1.5 p-1.5 text-violet-500 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <Input
          placeholder="Project URL (e.g. https://myproject.com)"
          value={item.link || ""}
          onChange={(e) => updateProject && updateProject(idx, { link: e.target.value })}
          className={cn(
            fieldClass,
            item.link && !isValidUrl(item.link) && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
          )}
        />
        {item.link && !isValidUrl(item.link) && (
          <p className="text-[10px] text-red-500">
            Please enter a valid URL (starting with http:// or https://)
          </p>
        )}
      </div>
      <details className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <summary className="cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">Screenshots</summary>
        <div className="mt-3 space-y-3">
          <label className="block space-y-1 text-xs">
            <span>Source code URL</span>
            <Input aria-label="Source code URL" placeholder="https://github.com/you/project" value={item.sourceUrl ?? ""} maxLength={2048} onChange={(e) => updateProject?.(idx, { sourceUrl: e.target.value })} className={fieldClass} />
          </label>
          <p className="text-[11px] text-zinc-500">Add up to 8 public image links. The first screenshot is the cover. Only use images you have permission to publish.</p>
          <p className="text-[11px] text-zinc-500">Recommended cover: 16:10 (e.g. 1600 × 1000 px). Portrait/mobile screenshots fit without cropping; landscape covers fill the frame. {screenshots.length} of 8 images added.</p>
          {screenshots.map((screenshot, screenshotIndex) => (
            <details key={screenshotIndex} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-700">
              <summary className="cursor-pointer truncate text-xs">Image {screenshotIndex + 1}{screenshotIndex === 0 ? " · Cover" : ""}{screenshot.caption ? ` · ${screenshot.caption}` : ""}</summary>
              <div className="mt-2 space-y-2">
              <div className="max-w-28"><ProjectImage url={screenshot.url} thumbnailUrl={screenshot.thumbnailUrl} alt={screenshot.caption || `${item.title} screenshot ${screenshotIndex + 1}`} /></div>
              <Input aria-label={`Screenshot ${screenshotIndex + 1} URL`} value={screenshot.url} maxLength={2048} className={fieldClass} onChange={(e) => updateProject?.(idx, { screenshots: screenshots.map((shot, n) => n === screenshotIndex ? { ...shot, url: e.target.value, thumbnailUrl: undefined } : shot) })} />
              <Input aria-label={`Screenshot ${screenshotIndex + 1} caption`} placeholder="Describe this screenshot (also used as alt text)" value={screenshot.caption ?? ""} maxLength={200} className={fieldClass} onChange={(e) => updateProject?.(idx, { screenshots: screenshots.map((shot, n) => n === screenshotIndex ? { ...shot, caption: e.target.value } : shot) })} />
              <div className="flex gap-2">
                {screenshotIndex > 0 && <Button type="button" variant="outline" size="sm" onClick={() => updateProject?.(idx, { screenshots: [screenshot, ...screenshots.filter((_, n) => n !== screenshotIndex)] })}>Make cover</Button>}
                <Button type="button" variant="outline" size="sm" onClick={() => updateProject?.(idx, { screenshots: screenshots.filter((_, n) => n !== screenshotIndex) })}>Remove image</Button>
              </div>
              <p className="text-[10px] text-zinc-500">Removes this image from your live portfolio after publishing. New uploads are eligible for cleanup only after 7 days unused by any saved draft or published portfolio.</p>
              </div>
            </details>
          ))}
          {screenshots.length < 8 && <div className="space-y-2">
            <label className="block space-y-2 text-xs">
              <span>{isUploading ? "Uploading…" : "Upload screenshot (PNG, JPEG, WebP · max 3 MB)"}</span>
              <Input aria-label="Upload screenshot" type="file" accept={PROJECT_IMAGE_TYPES.join(",")} disabled={isUploading || !uploadScreenshot} className={fieldClass} onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                if (file.size > MAX_PROJECT_IMAGE_BYTES || !PROJECT_IMAGE_TYPES.some((type) => type === file.type)) {
                  useToastStore.getState().toast("Choose a PNG, JPEG, or WebP image smaller than 3 MB.", "error");
                  return;
                }
                setIsUploading(true);
                try { await uploadScreenshot(item.id, file); }
                catch (error) { useToastStore.getState().toast(error instanceof Error ? error.message : "Unable to upload this image.", "error", 5000); }
                finally { setIsUploading(false); }
              }} />
            </label>
            <Input aria-label="New screenshot URL" placeholder="https://…/screenshot.png" value={screenshotUrl} maxLength={2048} onChange={(e) => setScreenshotUrl(e.target.value)} className={fieldClass} />
            <Button type="button" variant="outline" size="sm" disabled={!PublicMediaUrlSchema.safeParse(screenshotUrl).success} onClick={() => { updateProject?.(idx, { screenshots: [...screenshots, { url: screenshotUrl, caption: "" }] }); setScreenshotUrl(""); }}>Add screenshot</Button>
          </div>}
        </div>
      </details>
      <div className="space-y-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold">
          <div className="space-y-0.5">
            <span>Mobile App (iOS / Android)</span>
            <p className="text-[10px] font-normal text-zinc-500">Display screenshots inside an authentic iPhone device frame</p>
          </div>
          <input
            type="checkbox"
            role="switch"
            aria-label="Mobile App (iOS / Android)"
            checked={Boolean(item.isMobile)}
            onChange={(event) => updateProject?.(idx, { isMobile: event.target.checked })}
            className="h-4 w-4 accent-violet-600"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold">
          <span>Enable case study</span>
          <input type="checkbox" role="switch" aria-label="Enable case study" checked={caseStudyEnabled} onChange={(event) => updateProject?.(idx, { caseStudyEnabled: event.target.checked })} className="h-4 w-4 accent-violet-600" />
        </label>
        {caseStudyEnabled ? <details>
          <summary className="cursor-pointer text-xs text-violet-600 dark:text-violet-400">Edit case study</summary>
          <div className="mt-2 space-y-2">
            <p className="text-[10px] text-zinc-500">The public link appears after you add at least one section and publish. Turning this off keeps your writing for later.</p>
            {(Object.entries(CASE_STUDY_FIELDS) as Array<[keyof typeof CASE_STUDY_FIELDS, string]>).map(([key, label]) => (
              <details key={key} name={`case-study-${item.id}`} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-700">
                <summary className="cursor-pointer text-xs">{label}<span className="ml-2 text-[10px] text-zinc-500">{item.caseStudy?.[key]?.trim() ? "Added" : "Optional"}</span></summary>
                <Textarea aria-label={label} value={item.caseStudy?.[key] ?? ""} maxLength={10000} onChange={(e) => updateProject?.(idx, { caseStudy: { ...item.caseStudy, [key]: e.target.value } })} className={cn(fieldClass, "mt-2 min-h-16 resize-y")} />
              </details>
            ))}
          </div>
        </details> : <p className="text-[10px] text-zinc-500">No case-study link or page will be shown.</p>}
      </div>
    </div>
  );
}

function SortableItem({ id, item, idx, items, updateProject, handleUpdate, fieldClass, isValidUrl, uploadScreenshot }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <ProjectItemUI
        item={item}
        idx={idx}
        items={items}
        updateProject={updateProject}
        handleUpdate={handleUpdate}
        fieldClass={fieldClass}
        isValidUrl={isValidUrl}
        dragHandleProps={{ ...attributes, ...listeners }}
        uploadScreenshot={uploadScreenshot}
      />
    </div>
  );
}

interface ProjectsBlockEditorProps {
  block: Section;
  handleUpdate: (newData: any) => void;
  fieldClass: string;
  isValidUrl: (url: string) => boolean;
}

export function ProjectsBlockEditor({
  block,
  handleUpdate,
  fieldClass,
  isValidUrl,
}: ProjectsBlockEditorProps) {
  const content: any = block.content || {};
  const items = (content.items || [
    { title: "", description: "", link: "" },
  ]).map((it: any) => ({
    ...it,
    id: it.id || crypto.randomUUID(),
    isVisible: it.isVisible ?? true,
  }));

  const [activeId, setActiveId] = useState<string | null>(null);
  const setIsDraggingBlock = usePortfolioStore((state) => state.setIsDraggingBlock);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((it: any) => it.id === active.id);
      const newIndex = items.findIndex((it: any) => it.id === over.id);
      handleUpdate({ items: arrayMove(items, oldIndex, newIndex) });
    }
  };

  const updateProject = (index: number, fields: any) => {
    const newItems = items.map((it: any, i: number) =>
      i === index ? { ...it, ...fields } : { ...it }
    );
    handleUpdate({ items: newItems });
  };

  const uploadScreenshot = async (projectId: string, file: File) => {
    // Persist legacy IDs before awaiting the upload. Apply the result to current
    // state by ID so dragging, editing or removing a project cannot overwrite edits.
    handleUpdate({ items });
    const response = await fetch("/api/project-images", { method: "POST", headers: { "Content-Type": file.type }, body: file });
    const result = await response.json().catch(() => null) as { url?: string; thumbnailUrl?: string; error?: string } | null;
    if (!response.ok || !result?.url) throw new Error(result?.error || "Unable to upload this image right now.");
    const state = usePortfolioStore.getState();
    const current = state.sections.find((section) => section.id === block.id);
    if (current?.type !== "PROJECTS") return;
    state.updateBlockData(block.id, { items: current.content.items.map((project) => project.id === projectId && (project.screenshots?.length ?? 0) < 8 ? { ...project, screenshots: [...(project.screenshots ?? []), { url: result.url!, thumbnailUrl: result.thumbnailUrl, caption: "" }] } : project) });
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-[11px] text-red-500 italic px-1">
          At least one project is required.
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => {
          setActiveId(e.active.id as string);
          setIsDraggingBlock(true);
        }}
        onDragEnd={(e) => {
          setIsDraggingBlock(false);
          handleDragEnd(e);
        }}
        onDragCancel={() => {
          setActiveId(null);
          setIsDraggingBlock(false);
        }}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={items.map((it: any) => it.id)} strategy={verticalListSortingStrategy}>
          {items.map((item: any, idx: number) => (
            <SortableItem
              key={item.id}
              id={item.id}
              item={item}
              idx={idx}
              items={items}
              updateProject={updateProject}
              handleUpdate={handleUpdate}
              fieldClass={fieldClass}
              isValidUrl={isValidUrl}
              uploadScreenshot={uploadScreenshot}
            />
          ))}
        </SortableContext>
        <DragOverlay adjustScale={false}>
          {activeId ? (
            <div className="shadow-2xl opacity-100 ring-2 ring-violet-500/50 rounded-lg">
              <ProjectItemUI
                item={items.find((it: any) => it.id === activeId)}
                idx={items.findIndex((it: any) => it.id === activeId)}
                items={items}
                updateProject={null}
                handleUpdate={null}
                fieldClass={fieldClass}
                isValidUrl={isValidUrl}
                dragHandleProps={{}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <button
        onClick={() =>
          handleUpdate({
            items: [
              ...items,
              { id: crypto.randomUUID(), isVisible: true, featured: false, title: "", description: "", link: "" },
            ],
          })
        }
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 transition-all cursor-pointer"
      >
        <Plus className="w-3 h-3" /> Add Project
      </button>
    </div>
  );
}
