"use client";

import { useState } from "react";
import { Calculator, ScanLine } from "lucide-react";
import { clsx } from "clsx";
import { useTaxCalculator } from "@/hooks/use-tax-calculator";
import { useEstados } from "@/hooks/use-estados";
import { InputPanel } from "./input-panel";
import { PriceDisplay } from "./price-display";
import { BreakdownChart } from "./breakdown-chart";
import { BreakdownList } from "./breakdown-list";
import { NfeScanner } from "./nfe-scanner";
import { LaborEffortCard } from "./labor-effort-card";

// ============================================================
// Skeleton UI — Progressive Disclosure
// ============================================================
function CalculatorSkeleton() {
  return (
    <div
      className="flex w-full max-w-5xl flex-col gap-6 select-none"
      aria-hidden="true"
    >
      {/* Row 1: Price + Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Price skeleton */}
        <div className="card-glass flex flex-col gap-5 rounded-2xl p-5">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-[10px] w-20 rounded" />
            <div
              className="skeleton h-10 w-44 rounded-lg"
              style={{ animationDelay: "0.1s" }}
            />
            <div className="skeleton-dim h-[9px] w-36 rounded" />
          </div>
          <div className="h-px bg-white/[0.04]" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-[9px] w-16 rounded" />
              <div
                className="skeleton h-8 w-32 rounded-lg"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <div className="skeleton-dim h-6 w-10 rounded-lg" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-[9px] w-24 rounded" />
              <div
                className="skeleton h-8 w-28 rounded-lg"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
            <div className="skeleton-dim h-6 w-12 rounded-lg" />
          </div>
        </div>

        {/* Chart skeleton */}
        <div className="card-glass flex flex-col items-center justify-center gap-4 rounded-2xl py-8">
          <div className="relative h-[200px] w-[200px]">
            <svg
              viewBox="0 0 200 200"
              className="h-full w-full"
              style={{ animation: "skeleton-breathe 2.8s ease-in-out infinite" }}
            >
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#10b981"
                strokeWidth="24"
                strokeDasharray="240 213"
                strokeDashoffset="-107"
                strokeLinecap="round"
                opacity="0.08"
              />
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#ef4444"
                strokeWidth="24"
                strokeDasharray="80 373"
                strokeDashoffset="133"
                strokeLinecap="round"
                opacity="0.07"
              />
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="24"
                strokeDasharray="50 403"
                strokeDashoffset="-173"
                strokeLinecap="round"
                opacity="0.06"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <div className="skeleton h-[9px] w-14 rounded" />
              <div
                className="skeleton h-6 w-24 rounded-lg"
                style={{ animationDelay: "0.15s" }}
              />
              <div className="skeleton-dim h-[9px] w-16 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Audit skeleton */}
      <div className="card-glass rounded-2xl p-6">
        <div className="skeleton mb-5 h-[9px] w-28 rounded" />
        <div className="flex flex-col divide-y divide-white/[0.04]">
          {[
            { label: 60, bar: 54 },
            { label: 45, bar: 38 },
            { label: 35, bar: 28 },
          ].map(({ label, bar }, i) => (
            <div key={i} className={i === 0 ? "pb-4" : "py-4"}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="skeleton h-5 w-14 rounded-md"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                  <div
                    className="skeleton-dim h-[9px] rounded"
                    style={{ width: `${label}px` }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="skeleton-dim h-[9px] w-8 rounded" />
                  <div
                    className="skeleton h-[11px] w-20 rounded"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                </div>
              </div>
              <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="skeleton h-full rounded-full"
                  style={{ width: `${bar}%`, animationDelay: `${i * 0.08}s` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-white/20">
        Digite um valor acima para revelar a analise tributaria completa
      </p>
    </div>
  );
}

// ============================================================
// Tabs de modo
// ============================================================
type AppMode = "calculadora" | "scanner";

const TABS: Array<{ id: AppMode; label: string; Icon: typeof Calculator }> = [
  { id: "calculadora", label: "Calculadora", Icon: Calculator },
  { id: "scanner", label: "Raio-X NF-e", Icon: ScanLine },
];

// ============================================================
// Componente principal
// ============================================================
export function TaxCalculator() {
  const [mode, setMode] = useState<AppMode>("calculadora");

  const {
    inputs,
    grossPrice,
    result,
    isValid,
    isDetectingLocation,
    setGrossPriceRaw,
    setProductCategory,
    setUf,
    setRegime,
  } = useTaxCalculator();

  const { estados, isLoading: isLoadingEstados } = useEstados();

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      {/* Tabs de modo */}
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

      {/* Modo: Calculadora manual */}
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
            onRegimeChange={setRegime}
          />

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
              {/* Labor Effort — visivel quando ha resultado calculado */}
              <LaborEffortCard totalTaxAmount={result.totalTaxAmount} />
            </>
          ) : (
            <CalculatorSkeleton />
          )}
        </>
      )}

      {/* Modo: Scanner NF-e */}
      {mode === "scanner" && <NfeScanner />}
    </div>
  );
}
