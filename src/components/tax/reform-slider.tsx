"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaxCalculationResult, TaxRegime } from "@/types/tax";
import { BRL, PCT } from "@/lib/utils";

interface ReformSliderProps {
  resultAtual: TaxCalculationResult;
  result2026: TaxCalculationResult;
  onRegimeChange: (regime: TaxRegime) => void;
}

export function ReformSlider({ resultAtual, result2026, onRegimeChange }: ReformSliderProps) {
  const [is2026, setIs2026] = useState(false);

  const handleToggle = useCallback(
    (active: boolean) => {
      setIs2026(active);
      onRegimeChange(active ? "reforma_2026" : "atual");
    },
    [onRegimeChange]
  );

  const delta = result2026.totalTaxAmount - resultAtual.totalTaxAmount;
  const deltaPct = resultAtual.totalTaxAmount > 0 ? delta / resultAtual.totalTaxAmount : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      {/* Header com toggle pill */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
          Simulador de Reforma Tributaria
        </p>

        {/* Toggle pill binario */}
        <button
          type="button"
          onClick={() => handleToggle(!is2026)}
          className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5 transition-all duration-200"
          aria-pressed={is2026}
        >
          <span
            className={[
              "rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all duration-200",
              !is2026
                ? "bg-white/[0.09] text-white/70"
                : "text-white/35",
            ].join(" ")}
          >
            2025
          </span>
          <span
            className={[
              "rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all duration-200",
              is2026
                ? "bg-teal-500/15 text-teal-400"
                : "text-white/35",
            ].join(" ")}
          >
            Hibrido 2026
          </span>
        </button>
      </div>

      {/* Valores lado a lado */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
          <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-white/30">
            Valor Real
          </p>
          <p className="font-mono text-[14px] font-bold tracking-tighter text-citizen-green">
            {BRL(is2026 ? result2026.netPrice : resultAtual.netPrice)}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
          <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-white/30">
            Total Impostos
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={is2026 ? "2026" : "atual"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className={[
                "font-mono text-[14px] font-bold tracking-tighter",
                is2026 ? "text-red-400" : "text-tax-red",
              ].join(" ")}
            >
              {BRL(is2026 ? result2026.totalTaxAmount : resultAtual.totalTaxAmount)}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
          <p className="mb-1 text-[9px] font-medium uppercase tracking-widest text-white/30">
            Aliquota
          </p>
          <p className="font-mono text-[14px] font-bold tracking-tighter text-white/65">
            {PCT(is2026 ? result2026.effectiveTaxRate : resultAtual.effectiveTaxRate)}
          </p>
        </div>
      </div>

      {/* Banner de alerta — visivel apenas em 2026 */}
      <AnimatePresence>
        {is2026 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-tax-red/20 bg-tax-red/[0.07] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold text-tax-red">
                  CARGA AUMENTOU em 2026
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-bold text-tax-red">
                    +{BRL(delta)}
                  </span>
                  <span className="rounded-full border border-tax-red/25 bg-tax-red/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-tax-red">
                    +{PCT(deltaPct)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-white/40">
                <span>Sistema atual</span>
                <span className="font-mono text-white/50">
                  {BRL(resultAtual.totalTaxAmount)}
                </span>
                <span className="text-teal-400/60">+ CBS 0,9%</span>
                <span className="text-teal-400/60">+ IBS 0,1%</span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-white/35">
                Reforma 2026 = Sistema Legado + 1% IVA Dual (CBS 0,9% + IBS 0,1%).
                Reducao progressiva apenas apos 2029. EC 132/2023.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
