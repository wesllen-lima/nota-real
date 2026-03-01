"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { BRL } from "@/lib/utils";

interface Props {
  totalTaxAmount: number;
}

function formatWorkTime(totalMinutes: number): string {
  if (totalMinutes < 1) return "< 1 min";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function LaborEffortCard({ totalTaxAmount }: Props) {
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [rawIncome, setRawIncome] = useState("3.000");

  // 22 dias uteis × 8h = 176h/mes
  const hourlyRate = monthlyIncome / 176;
  const taxMinutes = (totalTaxAmount / hourlyRate) * 60;
  // Progresso como % de um dia util completo (8h = 480 min)
  const dayPct = Math.min((taxMinutes / 480) * 100, 100);

  function handleIncomeChange(val: string) {
    const digits = val.replace(/\D/g, "");
    const num = parseInt(digits, 10) || 0;
    const clamped = Math.max(100, Math.min(num, 1_000_000));
    setMonthlyIncome(clamped);
    setRawIncome(num > 0 ? new Intl.NumberFormat("pt-BR").format(num) : "");
  }

  return (
    <div className="card-glass rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Clock size={13} style={{ color: "#F59E0B", opacity: 0.7 }} />
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
          Esforco Laboral
        </p>
      </div>

      {/* Stat principal */}
      <div className="mb-4">
        <p className="font-mono text-3xl font-bold tracking-tighter text-white/85">
          {formatWorkTime(taxMinutes)}
        </p>
        <p className="mt-1 text-[11px] text-white/30">
          de trabalho para pagar {BRL(totalTaxAmount)} em impostos
        </p>
      </div>

      {/* Barra de progresso — % do dia util */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-white/20">
            % de um dia util (8h)
          </span>
          <span className="font-mono text-[11px] font-semibold text-white/40">
            {dayPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${dayPct}%`,
              background: "linear-gradient(90deg, #F59E0B90, #F59E0B40)",
            }}
          />
        </div>
      </div>

      {/* Input de renda */}
      <div className="flex items-center gap-3 border-t border-white/[0.04] pt-4">
        <span className="shrink-0 text-[11px] text-white/30">
          Renda mensal:
        </span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-white/25">
            R$
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={rawIncome}
            onChange={(e) => handleIncomeChange(e.target.value)}
            className="w-full rounded-lg bg-white/[0.04] py-1.5 pl-8 pr-3 text-right font-mono text-[12px] font-semibold text-white/70 outline-none transition-colors focus:bg-white/[0.06]"
            style={{ border: "1px solid oklch(1 0 0 / 6%)" }}
          />
        </div>
      </div>
    </div>
  );
}
