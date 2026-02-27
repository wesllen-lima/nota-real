"use client";

import { useAppContext } from "@/context/impact-context";
import { LayoutDashboard } from "lucide-react";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

interface StatCardProps {
  label: string;
  value: string | null;
  sub?: string | null;
  accent: string;
  emptyLabel?: string;
}

function StatCard({ label, value, sub, accent, emptyLabel }: StatCardProps) {
  if (!value) {
    return (
      <div className="card-glass flex flex-col gap-2 rounded-2xl p-5 select-none" aria-hidden="true">
        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/20">
          {label}
        </p>
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton-dim h-[9px] w-24 rounded" />
        {emptyLabel && (
          <p className="mt-1 text-[10px] text-white/18">{emptyLabel}</p>
        )}
      </div>
    );
  }

  return (
    <div className="card-glass flex flex-col gap-1.5 rounded-2xl p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">{label}</p>
      <p className="font-mono text-2xl font-bold tracking-tighter" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-white/30">{sub}</p>}
    </div>
  );
}

export function DashboardSection() {
  const { taxResult, salaryResult, utilityResult, totalTaxImpact, hasAnyResult } = useAppContext();

  const totalSub = hasAnyResult
    ? [
        taxResult ? "consumo" : null,
        salaryResult ? "trabalho" : null,
        utilityResult ? "utilidades" : null,
      ]
        .filter(Boolean)
        .join(" + ")
    : null;

  const salaryPct =
    salaryResult && salaryResult.realLaborCost > 0
      ? PCT(totalTaxImpact / salaryResult.realLaborCost)
      : null;

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard size={15} className="text-white/30" />
        <h2 className="text-[13px] font-medium text-white/50">Visao Consolidada</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Carga Fiscal Total"
          value={hasAnyResult ? BRL(totalTaxImpact) : null}
          sub={salaryPct ? `${salaryPct} do custo total do trabalho` : totalSub ?? undefined}
          accent="#EF4444"
          emptyLabel="Use os modulos abaixo para popular"
        />
        <StatCard
          label="Imposto no Consumo"
          value={taxResult ? BRL(taxResult.totalTaxAmount) : null}
          sub={taxResult ? PCT(taxResult.effectiveTaxRate) + " do preco pago" : null}
          accent="#EF4444"
          emptyLabel="Va para Consumo para calcular"
        />
        <StatCard
          label="Encargos sobre Trabalho"
          value={salaryResult ? BRL(salaryResult.totalTaxBurden) : null}
          sub={
            salaryResult
              ? PCT(salaryResult.effectiveTotalRate) + " do custo total da empresa"
              : null
          }
          accent="#3B82F6"
          emptyLabel="Va para Trabalho para calcular"
        />
        <StatCard
          label="Impostos em Utilidades"
          value={utilityResult ? BRL(utilityResult.totalTaxAmount) : null}
          sub={
            utilityResult
              ? PCT(utilityResult.totalTaxRate) + " da fatura " + utilityResult.type
              : null
          }
          accent="#F59E0B"
          emptyLabel="Va para Utilidades para calcular"
        />
      </div>

      {!hasAnyResult && (
        <p className="text-center text-[12px] text-white/20">
          Nenhum calculo realizado ainda. Use os modulos Consumo, Trabalho ou Utilidades.
        </p>
      )}
    </div>
  );
}
