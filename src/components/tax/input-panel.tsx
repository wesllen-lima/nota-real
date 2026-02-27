"use client";

import { clsx } from "clsx";
import type { ProductCategory, TaxRegime } from "@/types/tax";
import type { CalculatorInputState } from "@/hooks/use-tax-calculator";
import type { Estado } from "@/types/ibge";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  geral: "Geral",
  alimentacao: "Alimentacao",
  eletronicos: "Eletronicos",
  combustivel: "Combustivel",
  vestuario: "Vestuario",
  servicos: "Servicos",
};

interface Props {
  inputs: CalculatorInputState;
  estados: Estado[];
  isLoadingEstados: boolean;
  isDetectingLocation: boolean;
  onGrossPriceChange: (v: string) => void;
  onCategoryChange: (v: ProductCategory) => void;
  onUfChange: (v: string) => void;
  onRegimeChange: (v: TaxRegime) => void;
}

export function InputPanel({
  inputs,
  estados,
  isLoadingEstados,
  isDetectingLocation,
  onGrossPriceChange,
  onCategoryChange,
  onUfChange,
  onRegimeChange,
}: Props) {
  return (
    <div className="card-glass w-full rounded-2xl p-6">
      <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
        Entrada
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Valor */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-white/40">Valor pago (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={inputs.grossPriceRaw}
            onChange={(e) => onGrossPriceChange(e.target.value)}
            className="input-field font-mono tracking-tight"
          />
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-white/40">Categoria</label>
          <select
            value={inputs.productCategory}
            onChange={(e) => onCategoryChange(e.target.value as ProductCategory)}
            className="select-field"
          >
            {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* UF — IBGE API */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between text-[11px] text-white/40">
            <span>Estado</span>
            {(isDetectingLocation || isLoadingEstados) && (
              <span className="text-gov-blue/50">auto...</span>
            )}
          </label>
          <select
            value={inputs.uf}
            onChange={(e) => onUfChange(e.target.value)}
            disabled={isLoadingEstados}
            className="select-field"
          >
            {!inputs.uf && (
              <option value="">
                {isDetectingLocation ? "Detectando..." : "Selecione"}
              </option>
            )}
            {estados.map((estado) => (
              <option key={estado.id} value={estado.sigla}>
                {estado.sigla} — {estado.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Regime */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-white/40">Sistema fiscal</label>
          <div className="flex gap-2">
            {(["atual", "reforma_2026"] as TaxRegime[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRegimeChange(r)}
                className={clsx(
                  "flex-1 rounded-xl px-3 py-[11px] text-[11px] font-medium transition-all duration-150",
                  inputs.regime === r
                    ? "border border-gov-blue/30 bg-gov-blue/10 text-gov-blue"
                    : "border border-white/6 bg-white/3 text-white/35 hover:bg-white/6 hover:text-white/55"
                )}
              >
                {r === "atual" ? "Atual" : "2026 IVA"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
