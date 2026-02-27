"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/impact-context";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

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
    red: { text: "text-tax-red", bg: "bg-tax-red/10", border: "border-tax-red/15" },
    amber: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/15" },
    blue: { text: "text-gov-blue", bg: "bg-gov-blue/10", border: "border-gov-blue/15" },
  };
  const c = colorMap[color];

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${c.bg} ${c.border}`}
    >
      <span className="text-[10px] text-white/35">{label}</span>
      <span className={`font-mono text-[12px] font-bold tabular-nums ${c.text}`}>{value}</span>
    </div>
  );
}

export function ImpactHeader() {
  const { hasAnyResult, totalTaxImpact, laborWorkHours, salaryResult } = useAppContext();

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
          animate={{ height: 52, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="sticky top-0 z-30 overflow-hidden border-b border-white/[0.05] bg-zinc-950/85 backdrop-blur-xl"
        >
          <div className="flex h-[52px] items-center gap-3 px-4 md:px-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/20">
              Impacto
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                label="Total Impostos"
                value={BRL(totalTaxImpact)}
                color="red"
              />
              {laborWorkHours !== null && (
                <Chip
                  label="Horas Trabalhadas"
                  value={`${laborWorkHours.toFixed(1)}h`}
                  color="amber"
                />
              )}
              {incomePercent !== null && (
                <Chip
                  label="% da Renda"
                  value={PCT(incomePercent)}
                  color="blue"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
