"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/impact-context";
import { BRL, PCT } from "@/lib/utils";

function Chip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "red" | "amber" | "blue";
}) {
  const colorMap = {
    red: { text: "text-tax-red", bg: "bg-tax-red/12", border: "border-tax-red/25" },
    amber: { text: "text-amber-400", bg: "bg-amber-400/12", border: "border-amber-400/25" },
    blue: { text: "text-gov-blue", bg: "bg-gov-blue/12", border: "border-gov-blue/25" },
  };
  const c = colorMap[color];

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${c.bg} ${c.border}`}
    >
      <span className="text-[10px] text-white/50">{label}</span>
      <span className={`font-mono text-[12px] font-bold tabular-nums ${c.text}`}>{value}</span>
    </div>
  );
}

export function ImpactHeader() {
  const { hasAnyResult, totalTaxImpact, laborWorkHours, salaryResult, taxResult, utilityResult } =
    useAppContext();

  const incomePercent =
    salaryResult && salaryResult.realLaborCost > 0
      ? totalTaxImpact / salaryResult.realLaborCost
      : null;

  return (
    <AnimatePresence>
      {hasAnyResult && (
        <motion.div
          key="impact-header"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="sticky top-0 z-30 overflow-hidden border-b border-white/[0.08] bg-zinc-950"
        >
          <div className="flex min-h-[52px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
              Impacto
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Chip label="Total Impostos" value={BRL(totalTaxImpact)} color="red" />
              {laborWorkHours !== null && (
                <Chip
                  label="Horas Trabalhadas"
                  value={`${laborWorkHours.toFixed(1)}h`}
                  color="amber"
                />
              )}
              {incomePercent !== null && (
                <Chip label="% da Renda" value={PCT(incomePercent)} color="blue" />
              )}
              <AnimatePresence>
                {taxResult && (
                  <motion.span
                    key="chip-consumo"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Chip label="Consumo" value={BRL(taxResult.totalTaxAmount)} color="red" />
                  </motion.span>
                )}
                {salaryResult && (
                  <motion.span
                    key="chip-trabalho"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Chip label="Trabalho" value={BRL(salaryResult.totalTaxBurden)} color="blue" />
                  </motion.span>
                )}
                {utilityResult && (
                  <motion.span
                    key="chip-utilidades"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Chip
                      label="Utilidades"
                      value={BRL(utilityResult.totalTaxAmount)}
                      color="amber"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
