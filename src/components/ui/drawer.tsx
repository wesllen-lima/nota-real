"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, description, children }: DrawerProps) {
  // Escape key + scroll lock
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Mobile — slide from bottom */}
          <motion.div
            key="drawer-mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="drawer-glass fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl md:hidden"
          >
            {/* Handle */}
            <div className="flex shrink-0 flex-col items-center px-6 pt-3 pb-4">
              <div className="mb-4 h-[3px] w-10 rounded-full bg-white/15" />
              <div className="flex w-full items-start justify-between">
                <div>
                  <h2 className="text-[15px] font-medium text-white/85">{title}</h2>
                  {description && (
                    <p className="mt-0.5 text-[12px] text-white/35">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-white/25 transition-colors hover:text-white/60"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="h-px bg-white/[0.05]" />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>

          {/* Desktop — slide from right */}
          <motion.div
            key="drawer-desktop"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="drawer-glass fixed inset-y-0 right-0 z-50 hidden w-[520px] flex-col border-l border-white/[0.05] md:flex"
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between px-7 pt-8 pb-5">
              <div>
                <h2 className="text-[16px] font-medium text-white/85">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-[12px] text-white/35">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/25 transition-colors hover:text-white/60"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="h-px bg-white/[0.05]" />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
