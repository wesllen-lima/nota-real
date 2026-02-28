"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/hooks/use-toast";

export function ToastContainer() {
  const toasts = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[200] flex flex-col items-end gap-2 md:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 16, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-xl border border-white/[0.09] bg-zinc-900 px-4 py-2.5 text-[12px] text-white/70 shadow-2xl"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
