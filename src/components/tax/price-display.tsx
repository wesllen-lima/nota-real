"use client";

import type { TaxCalculationResult } from "@/types/tax";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(v);

export function PriceDisplay({ result }: { result: TaxCalculationResult }) {
  const { hybridSummary } = result;

  return (
    <div className="flex flex-col gap-3">
      {/* Preco Real */}
      <div className="card-glass flex flex-col gap-1 rounded-2xl p-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
          Preco Real
        </p>
        <p className="font-mono text-4xl font-bold tracking-tighter text-citizen-green">
          {BRL(result.netPrice)}
        </p>
        <p className="text-[11px] text-white/30">
          {PCT(1 - result.effectiveTaxRate)} do valor pago — livre de impostos
        </p>
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] text-white/20">composicao</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Valor pago */}
      <div className="card-glass flex items-center justify-between rounded-2xl px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
            Valor Pago
          </p>
          <p className="font-mono text-2xl font-bold tracking-tighter text-white/80">
            {BRL(result.grossPrice)}
          </p>
        </div>
        <div className="chip-glass rounded-lg px-2.5 py-1 text-[10px] text-white/30">
          100%
        </div>
      </div>

      {/* Total em impostos */}
      <div className="card-glass rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
              Total em Impostos
            </p>
            <p className="font-mono text-2xl font-bold tracking-tighter text-tax-red">
              {BRL(result.totalTaxAmount)}
            </p>
          </div>
          <div
            className="chip-glass rounded-lg px-2.5 py-1 text-[10px]"
            style={{ color: "#ef4444aa" }}
          >
            {PCT(result.effectiveTaxRate)}
          </div>
        </div>

        {/* Decomposicao hibrida — apenas no regime 2026 */}
        {result.isHybrid && hybridSummary && (
          <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.04] pt-4">
            <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/20">
              Decomposicao 2026
            </p>

            {/* Linha legado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-[6px] w-[6px] rounded-full"
                  style={{ background: "#EF4444", opacity: 0.7 }}
                />
                <span className="text-[11px] text-white/40">
                  Sistema Legado (ICMS/PIS/COFINS)
                </span>
              </div>
              <span className="font-mono text-[12px] font-semibold text-white/50">
                {BRL(hybridSummary.legacyTaxAmount)}
              </span>
            </div>

            {/* Linha IVA teste */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-[6px] w-[6px] rounded-full"
                  style={{ background: "#14B8A6", opacity: 0.7 }}
                />
                <span className="text-[11px] text-white/40">
                  IVA Dual — Teste 2026
                  <span
                    className="ml-1.5 rounded px-1 py-0.5 text-[9px] font-semibold"
                    style={{
                      color: "#14B8A6",
                      background: "#14B8A610",
                      border: "1px solid #14B8A620",
                    }}
                  >
                    1%
                  </span>
                </span>
              </div>
              <span className="font-mono text-[12px] font-semibold" style={{ color: "#14B8A6" }}>
                {BRL(hybridSummary.ivaTaxAmount)}
              </span>
            </div>

            {/* Nota educacional */}
            <p className="mt-2 text-[10px] leading-relaxed text-white/20">
              Em 2026 ambos os sistemas coexistem. O IVA de 1% e apenas o motor
              de teste — a substituicao do legado ocorre entre 2029 e 2032.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
