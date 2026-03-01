"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CopyButton } from "./copy-button";

export interface TaxLineItem {
  label: string;
  value: string;
  color?: string;
}

interface StatCardProps {
  label: string;
  value: string | null;
  sub?: string | null;
  accent: string;
  emptyIcon: LucideIcon;
  emptyHint: string;
  layoutId: string;
  lines?: TaxLineItem[];
}

export const StatCard = memo(function StatCard({
  label,
  value,
  sub,
  accent,
  emptyIcon: EmptyIcon,
  emptyHint,
  layoutId,
  lines,
}: StatCardProps) {
  if (!value) {
    return (
      <motion.div
        layout
        layoutId={layoutId}
        className="flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 select-none"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2">
          <EmptyIcon size={13} className="shrink-0 text-white/20" />
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
            {label}
          </p>
        </div>
        <div className="skeleton h-5 w-20 rounded" />
        <p className="text-[10px] leading-relaxed text-white/25">{emptyHint}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      layoutId={layoutId}
      className="flex flex-col gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <p className="font-mono text-xl font-bold tracking-tighter" style={{ color: accent }}>
          {value}
        </p>
        <CopyButton text={value} />
      </div>
      {sub && <p className="text-[11px] text-white/40">{sub}</p>}
      {lines && lines.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 border-t border-white/[0.05] pt-2">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-white/45">{line.label}</span>
              <div className="flex items-center gap-1">
                <span
                  className="font-mono text-[10px] font-semibold tabular-nums"
                  style={{ color: line.color ?? "rgba(255,255,255,0.5)" }}
                >
                  {line.value}
                </span>
                <CopyButton text={line.value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});
