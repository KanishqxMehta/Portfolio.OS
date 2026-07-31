"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
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

function EducationItemUI({
  item,
  idx,
  items,
  handleUpdate,
  fieldClass,
  dragHandleProps,
}: any) {
  return (
    <div className={cn("p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/edu transition-colors relative", !item.isVisible && "opacity-50 grayscale")}>
      <div
        {...dragHandleProps}
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing opacity-0 group-hover/edu:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Degree {idx + 1}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover/edu:opacity-100 transition-all">
          <button
            onClick={() => {
              if (!handleUpdate) return;
              const newItems = items.map((it: any, i: number) =>
                i === idx ? { ...it, isVisible: !it.isVisible } : { ...it }
              );
              handleUpdate({ items: newItems });
            }}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
          >
            {item.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            onClick={() => {
              if (!handleUpdate) return;
              handleUpdate({ items: items.filter((_: any, i: number) => i !== idx) });
            }}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <Input 
        placeholder="University or School" 
        value={item.school || ""} 
        onChange={(e) => {
          if (!handleUpdate) return;
          const newItems = items.map((it: any, i: number) =>
            i === idx ? { ...it, school: e.target.value } : { ...it }
          );
          handleUpdate({ items: newItems });
        }} 
        className={cn(fieldClass, !item.school && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Input 
            placeholder="B.S. Computer Science" 
            value={item.degree || ""} 
            onChange={(e) => {
              if (!handleUpdate) return;
              const newItems = items.map((it: any, i: number) =>
                i === idx ? { ...it, degree: e.target.value } : { ...it }
              );
              handleUpdate({ items: newItems });
            }} 
            className={cn(fieldClass, !item.degree && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
          />
        </div>
        <div className="space-y-1">
          <Input 
            placeholder="2018 - 2022" 
            value={item.year || ""} 
            onChange={(e) => {
              if (!handleUpdate) return;
              const newItems = items.map((it: any, i: number) =>
                i === idx ? { ...it, year: e.target.value } : { ...it }
              );
              handleUpdate({ items: newItems });
            }} 
            className={cn(fieldClass, !item.year && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
          />
        </div>
      </div>

      <Input 
        placeholder="Grade / GPA (optional, e.g., 9.2 CGPA or 3.8/4.0 GPA)" 
        value={item.grade || ""} 
        onChange={(e) => {
          if (!handleUpdate) return;
          const newItems = items.map((it: any, i: number) =>
            i === idx ? { ...it, grade: e.target.value } : { ...it }
          );
          handleUpdate({ items: newItems });
        }} 
        className={fieldClass} 
      />
    </div>
  );
}

function SortableItem({ id, item, idx, items, handleUpdate, fieldClass }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <EducationItemUI
        item={item}
        idx={idx}
        items={items}
        handleUpdate={handleUpdate}
        fieldClass={fieldClass}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface EducationBlockEditorProps {
  block: Section;
  handleUpdate: (newData: any) => void;
  fieldClass: string;
}

export function EducationBlockEditor({
  block,
  handleUpdate,
  fieldClass,
}: EducationBlockEditorProps) {
  const content: any = block.content || {};
  const items = (content.items || [{ school: "", degree: "", year: "", grade: "" }]).map((it: any) => ({
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

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-[11px] text-red-500 italic px-1">At least one education entry is required.</p>
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
              handleUpdate={handleUpdate}
              fieldClass={fieldClass}
            />
          ))}
        </SortableContext>
        <DragOverlay adjustScale={false}>
          {activeId ? (
            <div className="shadow-2xl opacity-100 ring-2 ring-violet-500/50 rounded-lg">
              <EducationItemUI
                item={items.find((it: any) => it.id === activeId)}
                idx={items.findIndex((it: any) => it.id === activeId)}
                items={items}
                handleUpdate={null}
                fieldClass={fieldClass}
                dragHandleProps={{}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <button
        onClick={() => handleUpdate({ items: [...items, { id: crypto.randomUUID(), isVisible: true, school: "", degree: "", year: "", grade: "" }] })}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 transition-all cursor-pointer"
      >
        <Plus className="w-3 h-3" /> Add Degree
      </button>
    </div>
  );
}
