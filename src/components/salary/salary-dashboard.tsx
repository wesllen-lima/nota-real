"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Tooltip } from "radix-ui";
import { Info, Briefcase } from "lucide-react";
import { useSalaryCalculator } from "@/hooks/use-salary-calculator";
import { computeTaxTrail, EMPLOYEE_GLOSSARY } from "@/lib/salary-engine";
import type { EmployerCharge, SalaryBreakdown, TaxTrailShare } from "@/types/salary";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number) =>
  `${(v * 100).toFixed(1)}%`;

const TOOLTIP_STYLE = {
  background:
    "oklch(0.187 0 0 / 97%) padding-box, linear-gradient(135deg, oklch(1 0 0 / 9%) 0%, oklch(1 0 0 / 0%) 100%) border-box",
  border: "1px solid transparent",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

// ============================================================
// Tooltip padrao para encargos
// ============================================================
function ChargeTooltip({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={8}
          className="z-50 max-w-[280px] rounded-xl p-4 shadow-2xl"
          style={TOOLTIP_STYLE}
        >
          <p className="text-[11px] leading-relaxed text-white/55">{description}</p>
          <Tooltip.Arrow style={{ fill: "#18181b" }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// ============================================================
// Tooltip do Recharts para o stacked bar
// ============================================================
function BarCustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;

  const labels: Record<string, string> = {
    netSalary: "Salario Liquido",
    employeeDeductions: "Retencoes (INSS + IRPF)",
    employerCost: "Encargos Patronais",
  };
  const colors: Record<string, string> = {
    netSalary: "#10B981",
    employeeDeductions: "#EF4444",
    employerCost: "#3B82F6",
  };

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
                style={{ background: colors[item.dataKey] }}
              />
              <span className="text-[11px] text-white/55">
                {labels[item.dataKey]}
              </span>
            </div>
            <span
              className="font-mono text-[12px] font-bold"
              style={{ color: colors[item.dataKey] }}
            >
              {BRL(item.value)}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}

// ============================================================
// Gráfico de barras empilhadas — stacked horizontal
// ============================================================
function SalaryStackedBar({ result }: { result: SalaryBreakdown }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = [
    {
      netSalary: result.netSalary,
      employeeDeductions: result.totalEmployeeDeductions,
      employerCost: result.totalEmployerCost,
    },
  ];

  if (!mounted) {
    return <div className="skeleton h-12 w-full rounded-xl" />;
  }

  return (
    <ResponsiveContainer width="99%" height={48}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap={0}
      >
        <defs>
          <linearGradient id="salary-bar-net" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="salary-bar-emp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id="salary-bar-patronal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.65} />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          hide
          domain={[0, result.realLaborCost]}
        />
        <YAxis type="category" hide />
        <Bar
          dataKey="netSalary"
          stackId="a"
          fill="url(#salary-bar-net)"
          barSize={48}
          radius={[8, 0, 0, 8]}
        />
        <Bar
          dataKey="employeeDeductions"
          stackId="a"
          fill="url(#salary-bar-emp)"
          barSize={48}
        />
        <Bar
          dataKey="employerCost"
          stackId="a"
          fill="url(#salary-bar-patronal)"
          barSize={48}
          radius={[0, 8, 8, 0]}
        />
        <RechartsTooltip
          content={<BarCustomTooltip />}
          cursor={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Linha de encargo com Tooltip
// ============================================================
function ChargeRow({
  label,
  rate,
  amount,
  description,
  color,
  isProvision = false,
}: {
  label: string;
  rate: number;
  amount: number;
  description: string;
  color: string;
  isProvision?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2">
        <ChargeTooltip description={description}>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-opacity hover:opacity-80"
            style={{
              border: `1px solid ${color}30`,
              color,
              background: `${color}10`,
            }}
          >
            {label}
            <Info size={9} style={{ opacity: 0.5 }} />
          </button>
        </ChargeTooltip>
        {isProvision && (
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-medium"
            style={{
              color: "#F59E0B99",
              background: "#F59E0B0D",
              border: "1px solid #F59E0B20",
            }}
          >
            provisao
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tabular-nums text-white/30">
          {(rate * 100).toFixed(2)}%
        </span>
        <span
          className="min-w-[84px] text-right font-mono text-[12px] font-semibold tabular-nums"
          style={{ color }}
        >
          {BRL(amount)}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Rastro do Sustento — decomposicao do imposto total
// ============================================================
function TaxTrailSection({ shares }: { shares: TaxTrailShare[] }) {
  const total = shares.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="mb-1 flex items-center gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
          Rastro do Sustento
        </p>
      </div>
      <p className="mb-5 text-[11px] text-white/30">
        Para onde vai cada {BRL(1)} dos{" "}
        <span className="font-mono font-semibold text-tax-red">
          {BRL(total)}
        </span>{" "}
        em impostos sobre o seu trabalho
      </p>

      <div className="flex flex-col gap-4">
        {shares.map((share) => (
          <div key={share.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ChargeTooltip description={share.description}>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[12px] font-medium text-white/70 transition-opacity hover:text-white/90"
                  >
                    <span
                      className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
                      style={{ background: share.color }}
                    />
                    {share.label}
                    <Info size={10} style={{ color: share.color, opacity: 0.4 }} />
                  </button>
                </ChargeTooltip>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] tabular-nums text-white/30">
                  {(share.percentage * 100).toFixed(0)}%
                </span>
                <span
                  className="min-w-[80px] text-right font-mono text-[12px] font-semibold tabular-nums"
                  style={{ color: share.color }}
                >
                  {BRL(share.amount)}
                </span>
              </div>
            </div>
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${share.percentage * 100}%`,
                  background: `linear-gradient(90deg, ${share.color}90, ${share.color}40)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[10px] leading-relaxed text-white/20">
        Distribuicao estimada com base na LOA 2024 (STN/SOF). Valores educacionais —
        a composicao exata varia conforme origem do tributo (renda, consumo ou folha).
      </p>
    </div>
  );
}

// ============================================================
// Skeleton
// ============================================================
function SalarySkeleton() {
  return (
    <div className="flex flex-col gap-4 select-none" aria-hidden="true">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-glass flex flex-col gap-2 rounded-2xl p-5">
            <div className="skeleton h-[9px] w-20 rounded" />
            <div
              className="skeleton h-8 w-32 rounded-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            <div className="skeleton-dim h-[9px] w-24 rounded" />
          </div>
        ))}
      </div>
      <div className="card-glass rounded-2xl p-5">
        <div className="skeleton mb-4 h-[9px] w-36 rounded" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="mt-3 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="skeleton-dim h-[5px] w-5 rounded-full" />
              <div className="skeleton-dim h-[9px] w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-[11px] text-white/20">
        Insira o salario bruto CLT para revelar o custo real do seu trabalho
      </p>
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================
export function SalaryDashboard() {
  const { rawSalary, setRawSalary, result, isValid } = useSalaryCalculator();

  const taxTrail = result
    ? computeTaxTrail(result.totalTaxBurden)
    : null;

  const directCharges = result?.employerCharges.filter((c) => !c.isProvision) ?? [];
  const provisions = result?.employerCharges.filter((c) => c.isProvision) ?? [];

  const CHARGE_COLOR: Record<EmployerCharge["governmentLevel"], string> = {
    federal: "#3B82F6",
    social: "#F59E0B",
    trabalhista: "#8B5CF6",
  };

  return (
    <Tooltip.Provider delayDuration={180}>
      <div className="flex w-full flex-col gap-6">
        {/* Input de salario */}
        <div className="card-glass w-full rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase size={14} style={{ color: "#10B981", opacity: 0.6 }} />
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
              Salario Bruto CLT
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-semibold text-white/25">R$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={rawSalary}
              onChange={(e) => setRawSalary(e.target.value)}
              className="input-field flex-1 font-mono text-xl tracking-tight"
            />
          </div>
          {!isValid && (
            <p className="mt-2 text-[11px] text-white/20">
              Informe o salario bruto registrado em carteira para calcular IRPF,
              INSS e todos os encargos patronais invisíveis.
            </p>
          )}
        </div>

        {isValid && result ? (
          <>
            {/* 3 stat cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Custo real para a empresa */}
              <div className="card-glass flex flex-col gap-1.5 rounded-2xl p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
                  Custo Real p/ Empresa
                </p>
                <p className="font-mono text-2xl font-bold tracking-tighter text-white/80">
                  {BRL(result.realLaborCost)}
                </p>
                <p className="text-[11px] text-white/30">
                  {PCT(result.totalEmployerCost / result.realLaborCost)} acima do salario bruto
                </p>
              </div>

              {/* Salario Liquido */}
              <div className="card-glass flex flex-col gap-1.5 rounded-2xl p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
                  Salario Liquido
                </p>
                <p className="font-mono text-2xl font-bold tracking-tighter text-citizen-green">
                  {BRL(result.netSalary)}
                </p>
                <p className="text-[11px] text-white/30">
                  {PCT(result.netSalary / result.realLaborCost)} do custo total da empresa
                </p>
              </div>

              {/* Carga tributaria total */}
              <div className="card-glass flex flex-col gap-1.5 rounded-2xl p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
                  Carga Tributaria Total
                </p>
                <p className="font-mono text-2xl font-bold tracking-tighter text-tax-red">
                  {BRL(result.totalTaxBurden)}
                </p>
                <p className="text-[11px] text-white/30">
                  {PCT(result.effectiveTotalRate)} do custo total da empresa
                </p>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="card-glass rounded-2xl p-5">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                Decomposicao do Custo Total do Trabalho
              </p>

              <SalaryStackedBar result={result} />

              {/* Legenda */}
              <div className="mt-3 flex flex-wrap gap-4">
                {[
                  {
                    key: "net",
                    label: "Salario Liquido",
                    value: result.netSalary,
                    color: "#10B981",
                    pct: result.netSalary / result.realLaborCost,
                  },
                  {
                    key: "emp",
                    label: "Retencoes (INSS + IRPF)",
                    value: result.totalEmployeeDeductions,
                    color: "#EF4444",
                    pct: result.totalEmployeeDeductions / result.realLaborCost,
                  },
                  {
                    key: "patronal",
                    label: "Encargos Invisiveis",
                    value: result.totalEmployerCost,
                    color: "#3B82F6",
                    pct: result.totalEmployerCost / result.realLaborCost,
                  },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <span
                      className="h-[5px] w-4 flex-shrink-0 rounded-full"
                      style={{ background: s.color, opacity: 0.8 }}
                    />
                    <span className="text-[11px] text-white/40">{s.label}</span>
                    <span
                      className="font-mono text-[11px] font-semibold"
                      style={{ color: s.color + "aa" }}
                    >
                      {PCT(s.pct)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown em 2 colunas */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Retencoes do empregado */}
              <div className="card-glass rounded-2xl p-5">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="h-[5px] w-5 rounded-full"
                    style={{ background: "#EF4444", opacity: 0.7 }}
                  />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Retencoes do Empregado
                  </p>
                </div>
                <p className="mb-3 text-[10px] text-white/20">
                  Visiveis no holerite — descontados na fonte
                </p>

                <div className="divide-y divide-white/[0.04]">
                  <ChargeRow
                    label="INSS"
                    rate={result.inssEmployee / result.grossSalary}
                    amount={result.inssEmployee}
                    description={EMPLOYEE_GLOSSARY.INSS}
                    color="#EF4444"
                  />
                  <ChargeRow
                    label="IRPF"
                    rate={result.irpfAmount / result.grossSalary}
                    amount={result.irpfAmount}
                    description={EMPLOYEE_GLOSSARY.IRPF}
                    color="#F87171"
                  />
                </div>

                <div
                  className="mt-3 flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "oklch(0.14 0 0 / 60%)", border: "1px solid oklch(1 0 0 / 5%)" }}
                >
                  <span className="text-[11px] text-white/35">Total Retido</span>
                  <span className="font-mono text-[13px] font-bold tracking-tighter text-tax-red">
                    {BRL(result.totalEmployeeDeductions)}
                  </span>
                </div>

                {result.marginalIrpfRate > 0 && (
                  <p className="mt-2.5 text-[10px] text-white/20">
                    Aliquota marginal IRPF:{" "}
                    <span className="font-mono font-semibold text-white/35">
                      {(result.marginalIrpfRate * 100).toFixed(1)}%
                    </span>{" "}
                    · Aliquota efetiva:{" "}
                    <span className="font-mono font-semibold text-white/35">
                      {PCT(result.effectiveEmployeeRate)}
                    </span>
                  </p>
                )}
              </div>

              {/* Encargos patronais */}
              <div className="card-glass rounded-2xl p-5">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="h-[5px] w-5 rounded-full"
                    style={{ background: "#3B82F6", opacity: 0.7 }}
                  />
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Encargos Patronais — Socio Oculto
                  </p>
                </div>
                <p className="mb-3 text-[10px] text-white/20">
                  Invisiveis ao empregado — pagos pela empresa sobre a sua folha
                </p>

                <div className="divide-y divide-white/[0.04]">
                  {directCharges.map((charge) => (
                    <ChargeRow
                      key={charge.code}
                      label={charge.label}
                      rate={charge.rate}
                      amount={charge.amount}
                      description={charge.description}
                      color={CHARGE_COLOR[charge.governmentLevel]}
                    />
                  ))}
                </div>

                {provisions.length > 0 && (
                  <>
                    <div className="my-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.04]" />
                      <span className="text-[9px] uppercase tracking-[0.12em] text-white/20">
                        provisoes mensais
                      </span>
                      <div className="h-px flex-1 bg-white/[0.04]" />
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {provisions.map((charge) => (
                        <ChargeRow
                          key={charge.code}
                          label={charge.label}
                          rate={charge.rate}
                          amount={charge.amount}
                          description={charge.description}
                          color={CHARGE_COLOR[charge.governmentLevel]}
                          isProvision
                        />
                      ))}
                    </div>
                  </>
                )}

                <div
                  className="mt-3 flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "oklch(0.14 0 0 / 60%)", border: "1px solid oklch(1 0 0 / 5%)" }}
                >
                  <span className="text-[11px] text-white/35">Custo Invisivel</span>
                  <span className="font-mono text-[13px] font-bold tracking-tighter text-gov-blue">
                    {BRL(result.totalEmployerCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rastro do Sustento */}
            {taxTrail && <TaxTrailSection shares={taxTrail} />}
          </>
        ) : (
          <SalarySkeleton />
        )}
      </div>
    </Tooltip.Provider>
  );
}
