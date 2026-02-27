"use client";

import { useEffect, useState } from "react";
import { Calculator, ScanLine } from "lucide-react";
import { clsx } from "clsx";
import { useTaxCalculator } from "@/hooks/use-tax-calculator";
import { useEstados } from "@/hooks/use-estados";
import { useAppContext } from "@/context/impact-context";
import { InputPanel } from "@/components/tax/input-panel";
import { PriceDisplay } from "@/components/tax/price-display";
import { BreakdownChart } from "@/components/tax/breakdown-chart";
import { BreakdownList } from "@/components/tax/breakdown-list";
import { NfeScanner } from "@/components/tax/nfe-scanner";
import { LaborEffortCard } from "@/components/tax/labor-effort-card";
import { ReformSlider } from "@/components/tax/reform-slider";
import { IndignacaoCard } from "@/components/tax/indignacao-card";

// ============================================================
// Skeleton UI
// ============================================================
function CalculatorSkeleton() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 select-none" aria-hidden="true">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-glass flex flex-col gap-5 rounded-2xl p-5">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-[10px] w-20 rounded" />
            <div className="skeleton h-10 w-44 rounded-lg" style={{ animationDelay: "0.1s" }} />
            <div className="skeleton-dim h-[9px] w-36 rounded" />
          </div>
          <div className="h-px bg-white/[0.04]" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-[9px] w-16 rounded" />
              <div className="skeleton h-8 w-32 rounded-lg" style={{ animationDelay: "0.2s" }} />
            </div>
            <div className="skeleton-dim h-6 w-10 rounded-lg" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-[9px] w-24 rounded" />
              <div className="skeleton h-8 w-28 rounded-lg" style={{ animationDelay: "0.3s" }} />
            </div>
            <div className="skeleton-dim h-6 w-12 rounded-lg" />
          </div>
        </div>

        <div className="card-glass flex flex-col items-center justify-center gap-4 rounded-2xl py-8">
          <div className="relative h-[200px] w-[200px]">
            <svg
              viewBox="0 0 200 200"
              className="h-full w-full"
              style={{ animation: "skeleton-breathe 2.8s ease-in-out infinite" }}
            >
              <circle cx="100" cy="100" r="72" fill="none" stroke="#10b981" strokeWidth="24" strokeDasharray="240 213" strokeDashoffset="-107" strokeLinecap="round" opacity="0.08" />
              <circle cx="100" cy="100" r="72" fill="none" stroke="#ef4444" strokeWidth="24" strokeDasharray="80 373" strokeDashoffset="133" strokeLinecap="round" opacity="0.07" />
              <circle cx="100" cy="100" r="72" fill="none" stroke="#3b82f6" strokeWidth="24" strokeDasharray="50 403" strokeDashoffset="-173" strokeLinecap="round" opacity="0.06" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <div className="skeleton h-[9px] w-14 rounded" />
              <div className="skeleton h-6 w-24 rounded-lg" style={{ animationDelay: "0.15s" }} />
              <div className="skeleton-dim h-[9px] w-16 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="card-glass rounded-2xl p-6">
        <div className="skeleton mb-5 h-[9px] w-28 rounded" />
        <div className="flex flex-col divide-y divide-white/[0.04]">
          {[{ label: 60, bar: 54 }, { label: 45, bar: 38 }, { label: 35, bar: 28 }].map(
            ({ label, bar }, i) => (
              <div key={i} className={i === 0 ? "pb-4" : "py-4"}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton h-5 w-14 rounded-md" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div className="skeleton-dim h-[9px] rounded" style={{ width: `${label}px` }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="skeleton-dim h-[9px] w-8 rounded" />
                    <div className="skeleton h-[11px] w-20 rounded" style={{ animationDelay: `${i * 0.12}s` }} />
                  </div>
                </div>
                <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div className="skeleton h-full rounded-full" style={{ width: `${bar}%`, animationDelay: `${i * 0.08}s` }} />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-white/20">
        Digite um valor acima para revelar a analise tributaria completa
      </p>
    </div>
  );
}

// ============================================================
// Tabs
// ============================================================
type ConsumoMode = "calculadora" | "scanner";

const TABS: Array<{ id: ConsumoMode; label: string; Icon: typeof Calculator }> = [
  { id: "calculadora", label: "Manual", Icon: Calculator },
  { id: "scanner", label: "Raio-X NF-e", Icon: ScanLine },
];

// ============================================================
// Componente principal
// ============================================================
export function ConsumoSection() {
  const [mode, setMode] = useState<ConsumoMode>("calculadora");
  const { setTaxResult } = useAppContext();

  const {
    inputs,
    grossPrice,
    result,
    resultAtual,
    result2026,
    isValid,
    isDetectingLocation,
    setGrossPriceRaw,
    setProductCategory,
    setUf,
    setRegime,
  } = useTaxCalculator();

  const { estados, isLoading: isLoadingEstados } = useEstados();

  useEffect(() => {
    setTaxResult(result);
  }, [result, setTaxResult]);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-2 self-start">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-medium transition-all duration-150",
              mode === id
                ? "border border-gov-blue/30 bg-gov-blue/10 text-gov-blue"
                : "border border-white/6 bg-white/3 text-white/35 hover:bg-white/6 hover:text-white/55"
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {mode === "calculadora" && (
        <>
          <InputPanel
            inputs={inputs}
            estados={estados}
            isLoadingEstados={isLoadingEstados}
            isDetectingLocation={isDetectingLocation}
            onGrossPriceChange={setGrossPriceRaw}
            onCategoryChange={setProductCategory}
            onUfChange={setUf}
          />

          {/* Slider Antes/Depois — visivel apenas quando ha valor */}
          {isValid && resultAtual && result2026 && (
            <ReformSlider
              resultAtual={resultAtual}
              result2026={result2026}
              onRegimeChange={setRegime}
            />
          )}

          {isValid && result ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <PriceDisplay result={result} />
                <div className="card-glass flex items-center justify-center rounded-2xl py-6">
                  <BreakdownChart result={result} />
                </div>
              </div>
              <BreakdownList
                breakdown={result.breakdown}
                grossPrice={grossPrice!}
                isHybrid={result.isHybrid}
              />
              <LaborEffortCard totalTaxAmount={result.totalTaxAmount} />
              <IndignacaoCard
                totalTaxAmount={result.totalTaxAmount}
                laborWorkHours={null}
                grossPrice={grossPrice!}
              />
            </>
          ) : (
            <CalculatorSkeleton />
          )}
        </>
      )}

      {mode === "scanner" && <NfeScanner />}
    </div>
  );
}
