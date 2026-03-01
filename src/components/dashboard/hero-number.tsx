"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useAppContext } from "@/context/impact-context";
import { calculateTaxBreakdown } from "@/lib/tax-engine";
import { BRL, PCT } from "@/lib/utils";
import { CopyButton } from "./copy-button";

function AnimatedCurrency({ value, className }: { value: number; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const controls = animate(from, value, {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = fmt.format(v);
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <p ref={ref} className={className}>
      {BRL(value)}
    </p>
  );
}

export function HeroNumber() {
  const { totalTaxImpact, hasAnyResult, salaryResult, laborWorkHours, taxResult, consumoInputs } =
    useAppContext();

  const delta2026 =
    taxResult && consumoInputs.regime === "atual" && consumoInputs.grossPriceRaw
      ? (() => {
          try {
            const gp = parseFloat(
              consumoInputs.grossPriceRaw.replace(/\./g, "").replace(",", ".")
            );
            if (gp <= 0) return null;
            const r2026 = calculateTaxBreakdown({
              grossPrice: gp,
              productCategory: consumoInputs.productCategory,
              regime: "reforma_2026",
            });
            return r2026.totalTaxAmount - taxResult.totalTaxAmount;
          } catch {
            return null;
          }
        })()
      : null;

  return (
    <div className="pt-2 pb-4">
      <div>
        {salaryResult && (
          <p className="mb-2 text-[10px] text-white/40">
            Renda declarada:{" "}
            <span className="font-mono font-semibold text-white/60">
              {BRL(salaryResult.grossSalary)}
            </span>
          </p>
        )}
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
          Carga Fiscal Total
        </p>

        <AnimatePresence mode="wait">
          {hasAnyResult ? (
            <motion.div
              key="hero-value"
              className="mt-2 flex items-start gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedCurrency
                value={totalTaxImpact}
                className="font-mono text-5xl font-bold tracking-tighter text-tax-red sm:text-6xl lg:text-[4.5rem]"
              />
              <CopyButton text={BRL(totalTaxImpact)} />
            </motion.div>
          ) : (
            <div key="hero-empty" className="mt-2 space-y-2">
              <div className="skeleton h-12 w-52 rounded-lg sm:h-16 sm:w-80" />
              <div className="skeleton-dim h-3 w-36 rounded sm:w-48" />
              <p className="text-[12px] leading-relaxed text-white/40">
                Informe sua renda para revelar quanto o Estado captura da sua produtividade.
              </p>
            </div>
          )}
        </AnimatePresence>

        {hasAnyResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            {laborWorkHours !== null && (
              <span className="text-[12px] text-white/45">
                ={" "}
                <span className="font-mono font-bold text-white/65">
                  {laborWorkHours.toFixed(0)}h
                </span>{" "}
                de trabalho/mes
              </span>
            )}
            {salaryResult && (
              <span className="text-[12px] text-white/45">
                <span className="font-mono font-bold text-tax-red/70">
                  {PCT(salaryResult.effectiveTotalRate)}
                </span>{" "}
                do custo total da empresa
              </span>
            )}
            {delta2026 !== null && delta2026 > 0 && (
              <span className="rounded-full border border-teal-400/15 bg-teal-400/[0.031] px-2 py-0.5 text-[10px] font-medium text-teal-400">
                +{BRL(delta2026)} com IVA 2026
              </span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
