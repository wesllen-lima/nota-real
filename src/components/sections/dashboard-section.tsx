"use client";

import { useCallback, useRef } from "react";
import { LayoutGroup } from "framer-motion";
import { Share2, Download, ShoppingCart, Briefcase, Zap } from "lucide-react";
import { useAppContext } from "@/context/impact-context";
import { shareImpact, exportFunnelImage } from "@/lib/export-card";
import { BRL, PCT } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { HeroNumber } from "@/components/dashboard/hero-number";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalaryFunnel } from "@/components/dashboard/salary-funnel";
import { SalaryIllusionExplainer } from "@/components/dashboard/salary-illusion-explainer";
import { CguBudgetCard } from "@/components/dashboard/cgu-budget-card";
import { TaxFreedomDayCard } from "@/components/dashboard/tax-freedom-day";

function Divider() {
  return <div className="h-px bg-white/[0.05]" />;
}

export function DashboardSection() {
  const {
    taxResult,
    salaryResult,
    utilityResult,
    nfeTaxAmount,
    totalTaxImpact,
    hasAnyResult,
    laborWorkHours,
  } = useAppContext();

  const funnelRef = useRef<HTMLDivElement>(null);
  const hasSalary = salaryResult !== null;

  const handleShare = useCallback(async () => {
    try {
      const result = await shareImpact({
        totalTaxAmount: totalTaxImpact,
        taxRate: salaryResult?.effectiveTotalRate ?? null,
        laborWorkHours,
        context: "dashboard",
      });
      if (result === "copied") toast("Copiado para a area de transferencia");
    } catch {
      // usuario cancelou o share sheet
    }
  }, [totalTaxImpact, salaryResult, laborWorkHours]);

  const handleExport = useCallback(async () => {
    if (!funnelRef.current) return;
    try {
      await exportFunnelImage(funnelRef.current);
    } catch {
      toast("Erro ao gerar imagem. Tente novamente.");
    }
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-background">
        <HeroNumber />

        {hasSalary && <Divider />}

        <div ref={funnelRef} className="relative">
          {hasSalary && (
            <span className="pointer-events-none absolute bottom-1 right-0 select-none font-mono text-[9px] text-white/15">
              nota-real.app
            </span>
          )}
          <SalaryFunnel />
        </div>

        {hasSalary && <Divider />}

        <SalaryIllusionExplainer />

        {hasSalary && <Divider />}

        <LayoutGroup id="dashboard-cards">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              layoutId="card-consumo"
              label="Consumo"
              value={
                taxResult || nfeTaxAmount !== null
                  ? BRL((taxResult?.totalTaxAmount ?? 0) + (nfeTaxAmount ?? 0))
                  : null
              }
              sub={
                taxResult
                  ? PCT(taxResult.effectiveTaxRate) + " do preco pago" + (nfeTaxAmount !== null ? " + NF-e" : "")
                  : nfeTaxAmount !== null
                  ? "Impostos reais da NF-e escaneada"
                  : null
              }
              accent="#EF4444"
              emptyIcon={ShoppingCart}
              emptyHint="Abra Consumo no menu para calcular."
              lines={[
                ...(taxResult?.breakdown.map((b) => ({
                  label: b.code,
                  value: BRL(b.amountPaid),
                  color: b.layer === "iva_teste" ? "#14b8a6" : "#EF444490",
                })) ?? []),
                ...(nfeTaxAmount !== null
                  ? [{ label: "NF-e Real", value: BRL(nfeTaxAmount), color: "#EF444490" }]
                  : []),
              ]}
            />
            <StatCard
              layoutId="card-trabalho"
              label="Trabalho (Impostos)"
              value={salaryResult ? BRL(salaryResult.totalTaxBurden) : null}
              sub={
                salaryResult
                  ? PCT(salaryResult.effectiveTotalRate) + " do custo total — so tributos"
                  : null
              }
              accent="#3B82F6"
              emptyIcon={Briefcase}
              emptyHint="Informe sua renda no onboarding."
              lines={
                salaryResult
                  ? [
                      { label: "INSS Empregado", value: BRL(salaryResult.inssEmployee), color: "#EF444490" },
                      { label: "IRPF", value: BRL(salaryResult.irpfAmount), color: "#F8717190" },
                      {
                        label: "Enc. Patronais (impostos)",
                        value: BRL(salaryResult.totalEmployerCost - salaryResult.totalLaborProvisions),
                        color: "#3B82F690",
                      },
                      {
                        label: "Direitos Trabalhistas",
                        value: BRL(salaryResult.totalLaborProvisions),
                        color: "#F59E0B90",
                      },
                    ]
                  : undefined
              }
            />
            <StatCard
              layoutId="card-utilidades"
              label="Utilidades"
              value={utilityResult ? BRL(utilityResult.totalTaxAmount) : null}
              sub={
                utilityResult
                  ? PCT(utilityResult.totalTaxRate) + " da fatura " + utilityResult.type
                  : null
              }
              accent="#F59E0B"
              emptyIcon={Zap}
              emptyHint="Abra Utilidades no menu para calcular."
              lines={
                utilityResult
                  ? [
                      { label: "ICMS", value: BRL(utilityResult.icmsAmount), color: "#EF444490" },
                      {
                        label: "PIS + COFINS",
                        value: BRL(utilityResult.pisAmount + utilityResult.cofinsAmount),
                        color: "#F9731690",
                      },
                      ...(utilityResult.cosip
                        ? [{ label: utilityResult.cosip.label, value: BRL(utilityResult.cosip.amount), color: "#F59E0B90" }]
                        : []),
                    ]
                  : undefined
              }
            />
          </div>
        </LayoutGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <CguBudgetCard totalTaxImpact={totalTaxImpact} />
          <TaxFreedomDayCard salaryResult={salaryResult} />
        </div>
      </div>

      {hasAnyResult && (
        <div className="flex items-center gap-2 self-end">
          {hasSalary && (
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-white/40 transition-all hover:border-white/12 hover:bg-white/[0.04] hover:text-white/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            >
              <Download size={12} className="shrink-0" />
              Exportar Extrato
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-white/40 transition-all hover:border-white/12 hover:bg-white/[0.04] hover:text-white/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
          >
            <Share2 size={12} className="shrink-0" />
            Compartilhar
          </button>
        </div>
      )}

      {!hasAnyResult && (
        <p className="text-[11px] text-white/30">
          Use o menu lateral para simular cada categoria.
        </p>
      )}
    </div>
  );
}
