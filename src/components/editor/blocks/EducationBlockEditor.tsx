"use client";

import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Section } from "@/lib/validations/portfolio";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
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

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {children}
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
  const items = (block.content?.items || [{ school: "", degree: "", year: "", grade: "" }]).map((it: any) => ({
    ...it,
    id: it.id || crypto.randomUUID(),
    isVisible: it.isVisible ?? true,
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((it: any) => it.id === active.id);
      const newIndex = items.findIndex((it: any) => it.id === over.id);
      handleUpdate({ items: arrayMove(items, oldIndex, newIndex) });
    }
  };

  const updateEducation = (index: number, fields: any) => {
    const newItems = items.map((it: any, i: number) =>
      i === index ? { ...it, ...fields } : { ...it }
    );
    handleUpdate({ items: newItems });
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-[11px] text-red-500 italic px-1">At least one education entry is required.</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={items.map((it: any) => it.id)} strategy={verticalListSortingStrategy}>
          {items.map((item: any, idx: number) => (
            <SortableItem key={item.id} id={item.id}>
              <div className={cn("p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 space-y-2 group/edu transition-colors relative", !item.isVisible && "opacity-50 grayscale")}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Degree {idx + 1}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover/edu:opacity-100 transition-all">
                    <button
                      onClick={() => updateEducation(idx, { isVisible: !item.isVisible })}
                      className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
                    >
                      {item.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleUpdate({ items: items.filter((_: any, i: number) => i !== idx) })}
                      className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <Input 
                  placeholder="University or School" 
                  value={item.school || ""} 
                  onChange={(e) => updateEducation(idx, { school: e.target.value })} 
                  className={cn(fieldClass, !item.school && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Input 
                      placeholder="B.S. Computer Science" 
                      value={item.degree || ""} 
                      onChange={(e) => updateEducation(idx, { degree: e.target.value })} 
                      className={cn(fieldClass, !item.degree && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Input 
                      placeholder="2018 - 2022" 
                      value={item.year || ""} 
                      onChange={(e) => updateEducation(idx, { year: e.target.value })} 
                      className={cn(fieldClass, !item.year && "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400")} 
                    />
                  </div>
                </div>

                <Input 
                  placeholder="Grade / GPA (optional, e.g., 9.2 CGPA or 3.8/4.0 GPA)" 
                  value={item.grade || ""} 
                  onChange={(e) => updateEducation(idx, { grade: e.target.value })} 
                  className={fieldClass} 
                />
              </div>
            </SortableItem>
          ))}
        </SortableContext>
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
