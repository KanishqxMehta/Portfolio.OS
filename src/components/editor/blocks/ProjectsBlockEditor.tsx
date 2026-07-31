"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Section } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/usePortfolioStore";
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
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

function ProjectItemUI({
  item,
  idx,
  items,
  updateProject,
  handleUpdate,
  fieldClass,
  isValidUrl,
  dragHandleProps,
}: any) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/proj transition-colors relative",
        !item.isVisible && "opacity-50 grayscale"
      )}
    >
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

      <Textarea
        placeholder="Short description of what you built and tech used..."
        value={item.description}
        onChange={(e) => updateProject && updateProject(idx, { description: e.target.value })}
        className={cn(
          fieldClass,
          "min-h-[60px] h-auto resize-none",
          !item.description && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
        )}
      />

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
    </div>
  );
}

function SortableItem({ id, item, idx, items, updateProject, handleUpdate, fieldClass, isValidUrl }: any) {
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
              { id: crypto.randomUUID(), isVisible: true, title: "", description: "", link: "" },
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
