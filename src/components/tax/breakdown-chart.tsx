"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from "recharts";
import type { TaxBreakdown, TaxCalculationResult } from "@/types/tax";

// Paleta por nivel de governo (sistema legado)
const LEGACY_PALETTE: Record<string, string[]> = {
  federal: ["#3B82F6", "#60A5FA", "#93C5FD"],
  estadual: ["#EF4444", "#F87171"],
  municipal: ["#F59E0B", "#FBBF24"],
};

// Paleta exclusiva para IVA teste (teal — visualmente distinto)
const IVA_COLORS = ["#14B8A6", "#2DD4BF"];

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface ChartSlice {
  name: string;
  value: number;
  color: string;
  description: string;
  layer: string;
}

function getSliceColor(
  b: TaxBreakdown,
  colorIndexes: Record<string, number>
): string {
  if (b.layer === "iva_teste") {
    const idx = (colorIndexes["iva"] ?? 0) % IVA_COLORS.length;
    colorIndexes["iva"] = idx + 1;
    return IVA_COLORS[idx];
  }
  const palette = LEGACY_PALETTE[b.governmentLevel] ?? LEGACY_PALETTE["federal"];
  const key = `legacy_${b.governmentLevel}`;
  const idx = (colorIndexes[key] ?? 0) % palette.length;
  colorIndexes[key] = idx + 1;
  return palette[idx];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartSlice }>;
}) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <div
      className="max-w-[220px] rounded-xl p-3 shadow-2xl"
      style={{
        background:
          "oklch(0.187 0 0 / 97%) padding-box, linear-gradient(135deg, oklch(1 0 0 / 8%) 0%, oklch(1 0 0 / 0%) 100%) border-box",
        border: "1px solid transparent",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ background: s.color }}
        />
        <p className="text-xs font-semibold text-white/80">{s.name}</p>
      </div>
      <p className="mt-1 font-mono text-sm font-bold" style={{ color: s.color }}>
        {BRL(s.value)}
      </p>
      <p className="mt-1.5 text-[11px] leading-snug text-white/40">
        {s.description.slice(0, 110)}
        {s.description.length > 110 ? "..." : ""}
      </p>
      {s.layer === "iva_teste" && (
        <p className="mt-2 text-[10px] font-medium" style={{ color: "#14B8A6aa" }}>
          Fase de teste — coexiste com o sistema legado
        </p>
      )}
    </div>
  );
}

export function BreakdownChart({ result }: { result: TaxCalculationResult }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  const colorIndexes: Record<string, number> = {};
  const taxSlices: ChartSlice[] = result.breakdown.map((b) => ({
    name: b.code,
    value: b.amountPaid,
    color: getSliceColor(b, colorIndexes),
    description: b.glossary.citizenDescription,
    layer: b.layer,
  }));

  const chartData: ChartSlice[] = [
    ...taxSlices,
    {
      name: "Valor Real",
      value: result.netPrice,
      color: "#10B981",
      description: "O preco real do produto, sem nenhum imposto embutido.",
      layer: "real",
    },
  ];

  if (!mounted) {
    return <div className="skeleton h-[240px] w-[240px] rounded-full" />;
  }

  const hasIva = result.isHybrid;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut */}
      <div className="relative flex items-center justify-center">
        <PieChart width={260} height={260}>
          <Pie
            data={chartData}
            dataKey="value"
            innerRadius={78}
            outerRadius={114}
            startAngle={90}
            endAngle={450}
            paddingAngle={1.5}
            strokeWidth={0}
          >
            {chartData.map((slice, i) => (
              <Cell key={i} fill={slice.color} opacity={0.9} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} cursor={false} />
        </PieChart>

        {/* Centro */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
            Valor Real
          </span>
          <span className="font-mono text-xl font-bold tracking-tighter text-citizen-green">
            {BRL(result.netPrice)}
          </span>
          <span className="font-mono text-xs font-medium text-tax-red/70">
            -{pct(result.effectiveTaxRate)}
          </span>
        </div>
      </div>

      {/* Legenda de camadas — exibida apenas no modo hibrido */}
      {hasIva && (
        <div className="flex items-center gap-4 px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-[5px] w-5 rounded-full" style={{ background: "#EF4444", opacity: 0.7 }} />
            <span className="text-[10px] text-white/30">Legado</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="h-[5px] w-5 rounded-full" style={{ background: "#14B8A6", opacity: 0.7 }} />
            <span className="text-[10px] text-white/30">IVA Teste</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="h-[5px] w-5 rounded-full" style={{ background: "#10B981", opacity: 0.7 }} />
            <span className="text-[10px] text-white/30">Real</span>
          </div>
        </div>
      )}
    </div>
  );
}
