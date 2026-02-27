"use client";

import { memo } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { LayoutDashboard, ShoppingCart, Briefcase, Zap } from "lucide-react";
import { useAppContext, type DrawerId } from "@/context/impact-context";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

// ============================================================
// Stat Card
// ============================================================
interface StatCardProps {
  label: string;
  value: string | null;
  sub?: string | null;
  accent: string;
  emptyLabel?: string;
  layoutId: string;
}

const StatCard = memo(function StatCard({ label, value, sub, accent, emptyLabel, layoutId }: StatCardProps) {
  if (!value) {
    return (
      <motion.div
        layout
        layoutId={layoutId}
        className="card-glass flex flex-col gap-2 rounded-2xl p-5 select-none"
        aria-hidden="true"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/20">
          {label}
        </p>
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton-dim h-[9px] w-24 rounded" />
        {emptyLabel && (
          <p className="mt-1 text-[10px] text-white/18">{emptyLabel}</p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      layoutId={layoutId}
      className="card-glass flex flex-col gap-1.5 rounded-2xl p-5"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">{label}</p>
      <p className="font-mono text-2xl font-bold tracking-tighter" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-white/30">{sub}</p>}
    </motion.div>
  );
});

// ============================================================
// CTA para abrir drawer
// ============================================================
interface CtaButtonProps {
  drawerId: DrawerId;
  label: string;
  Icon: typeof ShoppingCart;
}

function CtaButton({ drawerId, label, Icon }: CtaButtonProps) {
  const { setOpenDrawer } = useAppContext();
  return (
    <button
      type="button"
      onClick={() => setOpenDrawer(drawerId)}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.025] py-3 text-[12px] font-medium text-white/40 transition-all hover:border-white/10 hover:bg-white/[0.05] hover:text-white/65"
    >
      <Icon size={13} className="shrink-0" />
      {label}
    </button>
  );
}

// ============================================================
// Secao principal
// ============================================================
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

      <LayoutGroup id="dashboard-cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            layoutId="card-total"
            label="Carga Fiscal Total"
            value={hasAnyResult ? BRL(totalTaxImpact) : null}
            sub={salaryPct ? `${salaryPct} do custo total do trabalho` : totalSub ?? undefined}
            accent="#EF4444"
            emptyLabel="Use os modulos abaixo para popular"
          />
          <StatCard
            layoutId="card-consumo"
            label="Imposto no Consumo"
            value={taxResult ? BRL(taxResult.totalTaxAmount) : null}
            sub={taxResult ? PCT(taxResult.effectiveTaxRate) + " do preco pago" : null}
            accent="#EF4444"
            emptyLabel="Va para Consumo para calcular"
          />
          <StatCard
            layoutId="card-trabalho"
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
            layoutId="card-utilidades"
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
      </LayoutGroup>

      {/* CTAs para abrir drawers */}
      <div className="flex gap-2">
        <CtaButton drawerId="consumo" label="Calcular Consumo" Icon={ShoppingCart} />
        <CtaButton drawerId="trabalho" label="Simular Renda" Icon={Briefcase} />
        <CtaButton drawerId="utilidades" label="Scanner Contas" Icon={Zap} />
      </div>

      {!hasAnyResult && (
        <p className="text-center text-[12px] text-white/20">
          Nenhum calculo realizado ainda. Use os modulos acima para comecar.
        </p>
      )}
    </div>
  );
}
