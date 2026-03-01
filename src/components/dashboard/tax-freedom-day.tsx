"use client";

import { Calendar } from "lucide-react";
import { PCT } from "@/lib/utils";
import type { SalaryBreakdown } from "@/types/salary";

export function TaxFreedomDayCard({ salaryResult }: { salaryResult: SalaryBreakdown | null }) {
  if (!salaryResult) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="shrink-0 text-white/40" />
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">
            Dia da Liberdade Fiscal
          </p>
        </div>
        <div className="skeleton h-7 w-40 rounded-lg" />
        <p className="text-[11px] text-white/35">
          Informe sua renda para calcular o dia em que voce para de trabalhar para o governo.
        </p>
        <div className="skeleton-dim h-[3px] w-full rounded-full" />
      </div>
    );
  }

  const taxRate = salaryResult.effectiveTotalRate;
  const dayOfYear = Math.ceil(taxRate * 365);
  const date = new Date(2026, 0, 1);
  date.setDate(date.getDate() + dayOfYear - 1);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      <div className="flex items-center gap-2">
        <Calendar size={13} className="shrink-0 text-white/40" />
        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">
          Dia da Liberdade Fiscal
        </p>
      </div>

      <div>
        <p className="font-mono text-2xl font-bold tracking-tighter text-tax-red">{dateStr}</p>
        <p className="mt-0.5 text-[11px] text-white/45">Dia {dayOfYear} de 2026</p>
      </div>

      <p className="text-[11px] leading-relaxed text-white/35">
        Ate esta data, cada centavo que voce ganhou foi para o governo.
      </p>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/40">Carga efetiva total</span>
        <span className="font-mono text-[12px] font-bold text-tax-red">{PCT(taxRate)}</span>
      </div>

      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-tax-red/33"
          style={{ width: `${Math.min(taxRate * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
