"use client";

import { useCguGastos } from "@/hooks/use-cgu-gastos";
import { BRL } from "@/lib/utils";

const CGU_CATEGORIES: Array<{
  key: "previdencia" | "saude" | "educacao" | "assistencia" | "seguranca";
  label: string;
  color: string;
}> = [
  { key: "previdencia", label: "Previdencia Social", color: "#3B82F6" },
  { key: "saude",       label: "Saude",              color: "#10B981" },
  { key: "educacao",    label: "Educacao",            color: "#8B5CF6" },
  { key: "assistencia", label: "Assistencia Social",  color: "#F59E0B" },
  { key: "seguranca",   label: "Seguranca Publica",   color: "#EF4444" },
];

export function CguBudgetCard({ totalTaxImpact }: { totalTaxImpact: number }) {
  const { data, loading } = useCguGastos();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="skeleton h-3 w-40 rounded" />
        <div className="flex flex-col gap-2">
          {CGU_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center gap-2">
              <div className="skeleton h-[6px] w-[6px] shrink-0 rounded-full" />
              <div className="skeleton h-2.5 flex-1 rounded" />
              <div className="skeleton h-2.5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const total = CGU_CATEGORIES.reduce((sum, c) => sum + data[c.key], 0);
  const hasImpact = totalTaxImpact > 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">
            Destino dos Seus Impostos
          </p>
          <p className="mt-0.5 text-[11px] text-white/35">
            {hasImpact
              ? `Do seu ${BRL(totalTaxImpact)}/mes, estes valores vao para cada area`
              : "Distribuicao proporcional CGU 2026"}
          </p>
        </div>
        <span
          className={[
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium",
            data.source === "cgu_live"
              ? "border border-gov-blue/20 bg-gov-blue/[0.06] text-gov-blue"
              : "border border-amber-400/20 bg-amber-400/[0.06] text-amber-400",
          ].join(" ")}
        >
          <span
            className={[
              "h-[4px] w-[4px] rounded-full",
              data.source === "cgu_live" ? "bg-gov-blue" : "bg-amber-400",
            ].join(" ")}
          />
          {data.source === "cgu_live" ? "CGU ao vivo" : "LOA 2026 estimado"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {CGU_CATEGORIES.map((c) => {
          const pct = total > 0 ? data[c.key] / total : 0;
          const contrib = hasImpact ? pct * totalTaxImpact : null;
          return (
            <div key={c.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-[11px] text-white/55">{c.label}</span>
                </div>
                <span className="font-mono text-[11px] font-bold tabular-nums text-white/60">
                  {contrib !== null ? BRL(contrib) : `${(pct * 100).toFixed(1)}%`}
                </span>
              </div>
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct * 100}%`, backgroundColor: `${c.color}60` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
