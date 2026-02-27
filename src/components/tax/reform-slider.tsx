"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaxCalculationResult, TaxRegime } from "@/types/tax";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface ReformSliderProps {
  resultAtual: TaxCalculationResult;
  result2026: TaxCalculationResult;
  onRegimeChange: (regime: TaxRegime) => void;
}

export function ReformSlider({ resultAtual, result2026, onRegimeChange }: ReformSliderProps) {
  const [value, setValue] = useState(0);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const t = parseFloat(e.target.value);
      setValue(t);
      onRegimeChange(t > 0.5 ? "reforma_2026" : "atual");
    },
    [onRegimeChange]
  );

  const displayTax = lerp(resultAtual.totalTaxAmount, result2026.totalTaxAmount, value);
  const displayNet = lerp(resultAtual.netPrice, result2026.netPrice, value);
  const displayRate = lerp(resultAtual.effectiveTaxRate, result2026.effectiveTaxRate, value);

  const isIn2026 = value > 0.5;
  const isTransitioning = value > 0.05 && value < 0.95;

  return (
    <div className="card-glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
          Simulador de Reforma 2026
        </p>
        <AnimatePresence mode="wait">
          <motion.span
            key={isIn2026 ? "reforma" : "atual"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest ${
              isIn2026
                ? "bg-teal-500/10 text-teal-400/80"
                : "bg-white/[0.05] text-white/30"
            }`}
          >
            {isIn2026 ? "Hibrido 2026" : "Sistema Atual"}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Slider */}
      <div className="relative mb-6">
        <div className="flex justify-between text-[10px] text-white/30 mb-2">
          <span>Sistema Atual 2025</span>
          <span>Reforma 2026 (Legado + IVA)</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={handleChange}
            className="w-full appearance-none h-[3px] rounded-full outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${
                isIn2026 ? "#14B8A6" : "#3B82F6"
              } ${value * 100}%, rgba(255,255,255,0.08) ${value * 100}%)`,
            }}
          />
        </div>
        {isTransitioning && (
          <p className="mt-2 text-center text-[10px] text-white/25">
            Deslize para comparar os sistemas
          </p>
        )}
      </div>

      {/* Valores interpolados */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <p className="text-[9px] font-medium uppercase tracking-widest text-white/25 mb-1">
            Valor Real
          </p>
          <motion.p
            key={Math.round(displayNet * 10)}
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 0.12 }}
            className="font-mono text-[15px] font-bold tracking-tighter text-citizen-green"
          >
            {BRL(displayNet)}
          </motion.p>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <p className="text-[9px] font-medium uppercase tracking-widest text-white/25 mb-1">
            Total Impostos
          </p>
          <motion.p
            key={Math.round(displayTax * 10)}
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 0.12 }}
            className="font-mono text-[15px] font-bold tracking-tighter text-tax-red"
          >
            {BRL(displayTax)}
          </motion.p>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <p className="text-[9px] font-medium uppercase tracking-widest text-white/25 mb-1">
            Aliquota
          </p>
          <motion.p
            key={Math.round(displayRate * 1000)}
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 0.12 }}
            className="font-mono text-[15px] font-bold tracking-tighter text-white/70"
          >
            {PCT(displayRate)}
          </motion.p>
        </div>
      </div>

      {/* Nota 2026 */}
      <AnimatePresence>
        {isIn2026 && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden text-[10px] leading-relaxed text-teal-400/60"
          >
            Reforma 2026 = Sistema Legado + 1% IVA Dual (CBS 0,9% + IBS 0,1%). A carga total e
            maior em 2026. Reducao progressiva apenas apos 2029. (EC 132/2023)
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
