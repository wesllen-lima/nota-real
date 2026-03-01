"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { UtilityTaxResult } from "@/types/utility";
import { BRL } from "@/lib/utils";

const TOOLTIP_STYLE = {
  background:
    "oklch(0.187 0 0 / 97%) padding-box, linear-gradient(135deg, oklch(1 0 0 / 9%) 0%, oklch(1 0 0 / 0%) 100%) border-box",
  border: "1px solid transparent",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const LABELS: Record<string, string> = {
  netValue: "Valor sem impostos",
  icms: "ICMS",
  pisCofins: "PIS + COFINS",
  cosip: "COSIP",
  iva: "IVA Dual (CBS + IBS)",
};

const COLORS: Record<string, string> = {
  netValue: "#10B981",
  icms: "#EF4444",
  pisCofins: "#F97316",
  cosip: "#F59E0B",
  iva: "#14B8A6",
};

function UtilityBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl p-3 shadow-2xl" style={TOOLTIP_STYLE}>
      {payload.map((item) =>
        item.value > 0 ? (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-5 py-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-[6px] w-[6px] flex-shrink-0 rounded-full"
                style={{ background: COLORS[item.dataKey] }}
              />
              <span className="text-[11px] text-white/55">{LABELS[item.dataKey]}</span>
            </div>
            <span
              className="font-mono text-[12px] font-bold"
              style={{ color: COLORS[item.dataKey] }}
            >
              {BRL(item.value)}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}

export function UtilityStackedBar({ result }: { result: UtilityTaxResult }) {
  const pisCofins = result.pisAmount + result.cofinsAmount;
  const cosipAmount = result.cosip?.amount ?? 0;
  const ivaAmount = result.isHybrid ? result.cbsAmount + result.ibsAmount : 0;

  const chartData = [
    {
      netValue: result.netValue,
      icms: result.icmsAmount,
      pisCofins,
      cosip: cosipAmount,
      iva: ivaAmount,
    },
  ];

  const domain: [number, number] = [0, result.totalValue + ivaAmount];

  return (
    <ResponsiveContainer width="99%" height={48}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap={0}
      >
        <defs>
          <linearGradient id="utility-bar-net" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="utility-bar-icms" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="utility-bar-piscofins" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F97316" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#F97316" stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="utility-bar-cosip" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="utility-bar-iva" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.65} />
          </linearGradient>
        </defs>
        <XAxis type="number" hide domain={domain} />
        <YAxis type="category" hide />
        <Bar
          dataKey="netValue"
          stackId="a"
          fill="url(#utility-bar-net)"
          barSize={48}
          radius={[8, 0, 0, 8]}
        />
        <Bar dataKey="icms" stackId="a" fill="url(#utility-bar-icms)" barSize={48} />
        <Bar dataKey="pisCofins" stackId="a" fill="url(#utility-bar-piscofins)" barSize={48} />
        <Bar dataKey="cosip" stackId="a" fill="url(#utility-bar-cosip)" barSize={48} />
        <Bar
          dataKey="iva"
          stackId="a"
          fill="url(#utility-bar-iva)"
          barSize={48}
          radius={[0, 8, 8, 0]}
        />
        <RechartsTooltip content={<UtilityBarTooltip />} cursor={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
