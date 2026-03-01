"use client";

import { Tooltip } from "radix-ui";
import { Info } from "lucide-react";
import type { TaxBreakdown } from "@/types/tax";
import { BRL } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  federal: "#3B82F6",
  estadual: "#EF4444",
  municipal: "#F59E0B",
};
const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  estadual: "Estadual",
  municipal: "Municipal",
};

const IVA_COLOR = "#14B8A6";

interface Props {
  breakdown: TaxBreakdown[];
  grossPrice: number;
  isHybrid?: boolean;
}

function TaxRow({
  tax,
  grossPrice,
  isLast,
}: {
  tax: TaxBreakdown;
  grossPrice: number;
  isLast: boolean;
}) {
  const pctOfTotal = (tax.amountPaid / grossPrice) * 100;
  const barPct = Math.min(pctOfTotal, 100);
  const isIva = tax.layer === "iva_teste";
  const itemColor = isIva ? IVA_COLOR : (LEVEL_COLOR[tax.governmentLevel] ?? "#3B82F6");

  return (
    <div className={isLast ? "pt-4" : "py-4"}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-opacity hover:opacity-80"
                style={{
                  border: `1px solid ${itemColor}30`,
                  color: itemColor,
                  background: `${itemColor}10`,
                }}
              >
                {tax.code}
                <Info size={10} style={{ opacity: 0.5 }} />
              </button>
            </Tooltip.Trigger>

            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={8}
                className="tooltip-glass z-50 max-w-[280px] rounded-xl p-4 shadow-2xl"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {isIva ? "IVA Dual — Fase de Teste 2026" : LEVEL_LABEL[tax.governmentLevel]}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  {tax.glossary.fullName}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                  {tax.glossary.citizenDescription}
                </p>
                {tax.glossary.replacedBy.length > 0 && (
                  <p className="mt-2.5 text-[10px] text-[#F59E0B]/70">
                    Substituido por: {tax.glossary.replacedBy.join(", ")}
                  </p>
                )}
                {tax.glossary.replaces.length > 0 && (
                  <p className="mt-1.5 text-[10px] text-citizen-green/70">
                    Substitui: {tax.glossary.replaces.join(", ")}
                  </p>
                )}
                <Tooltip.Arrow style={{ fill: "#18181b" }} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <span className="text-[12px] text-white/35">
            {tax.effectivePercentage.toFixed(2)}% de aliquota
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] tabular-nums text-white/25">
            {pctOfTotal.toFixed(1)}%
          </span>
          <span
            className="min-w-[88px] text-right font-mono text-sm font-semibold tabular-nums"
            style={{ color: itemColor }}
          >
            {BRL(tax.amountPaid)}
          </span>
        </div>
      </div>

      <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barPct}%`,
            background: `linear-gradient(90deg, ${itemColor}90, ${itemColor}40)`,
          }}
        />
      </div>
    </div>
  );
}

export function BreakdownList({ breakdown, grossPrice, isHybrid = false }: Props) {
  const legacyItems = breakdown.filter((b) => b.layer === "legado");
  const ivaItems = breakdown.filter((b) => b.layer === "iva_teste");

  return (
    <div className="card-glass rounded-2xl p-6">
      <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
        Auditoria por Tributo
      </p>

      <Tooltip.Provider delayDuration={180}>
        <div className="flex flex-col">
          {isHybrid && legacyItems.length > 0 && (
            <div className="mb-1 flex items-center gap-2">
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ background: "#EF4444", opacity: 0.6 }}
              />
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                Sistema Legado
              </span>
            </div>
          )}

          <div className="divide-y divide-white/[0.04]">
            {legacyItems.map((tax, idx) => (
              <TaxRow
                key={tax.code}
                tax={tax}
                grossPrice={grossPrice}
                isLast={idx === 0 && !isHybrid}
              />
            ))}
          </div>

          {isHybrid && ivaItems.length > 0 && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide"
                    style={{
                      color: IVA_COLOR,
                      background: "#14B8A60D",
                      border: `1px solid #14B8A625`,
                    }}
                  >
                    NOVO
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                    IVA Dual — Fase de Teste
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                    style={{
                      color: IVA_COLOR + "99",
                      background: "#14B8A60D",
                      border: `1px solid #14B8A618`,
                    }}
                  >
                    1% fixo 2026
                  </span>
                </div>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>

              <div className="divide-y divide-white/[0.04]">
                {ivaItems.map((tax, idx) => (
                  <TaxRow
                    key={tax.code}
                    tax={tax}
                    grossPrice={grossPrice}
                    isLast={idx === 0}
                  />
                ))}
              </div>

              {/* Nota de transicao */}
              <div
                className="mt-5 rounded-xl p-3 text-[11px] leading-relaxed"
                style={{
                  background: "#14B8A605",
                  border: "1px solid #14B8A615",
                  color: "#ffffff55",
                }}
              >
                <span style={{ color: IVA_COLOR + "99" }}>EC 132/2023 — Art. 124:</span> Em 2026
                o IVA Dual opera em modo de teste com aliquota simbolica de 1%. O sistema
                legado permanece ativo ate 2032. A simplificacao progressiva ocorre entre
                2029 e 2033.
              </div>
            </>
          )}
        </div>
      </Tooltip.Provider>
    </div>
  );
}
