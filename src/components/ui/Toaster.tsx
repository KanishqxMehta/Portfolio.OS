"use client";

import { useToastStore, Toast } from "@/store/useToastStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Toaster = () => {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.4)] text-sm text-zinc-800 dark:text-zinc-200 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
