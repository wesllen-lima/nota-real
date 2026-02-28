"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, LayoutGroup, AnimatePresence, animate } from "framer-motion";
import { Calendar, Info, ChevronDown, Copy, Check, Share2, ShoppingCart, Briefcase, Zap } from "lucide-react";
import { useAppContext } from "@/context/impact-context";
import { computeTaxTrail, BUDGET_DISTRIBUTION } from "@/lib/salary-engine";
import { calculateTaxBreakdown } from "@/lib/tax-engine";
import { shareImpact } from "@/lib/export-card";
import { toast } from "@/hooks/use-toast";
import type { SalaryBreakdown } from "@/types/salary";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

// ============================================================
// #2 — Botao de copy discreta
// ============================================================
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded p-0.5 text-white/20 transition-colors hover:text-white/55"
      title="Copiar"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}

// ============================================================
// #1 — Contador animado para valores BRL
// ============================================================
function AnimatedCurrency({
  value,
  className,
}: {
  value: number;
  className: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const controls = animate(from, value, {
      duration: 0.75,
      ease: [0.25, 0.46, 0.45, 0.94],
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

// ============================================================
// Hero Number — Numero gigante do "Socio Oculto"
// ============================================================
function HeroNumber() {
  const { totalTaxImpact, hasAnyResult, salaryResult, laborWorkHours, taxResult, consumoInputs } =
    useAppContext();

  // #5 — delta da reforma 2026 no consumo (se tiver taxResult em regime atual)
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
          <p className="mb-2 text-[10px] text-zinc-500">
            Renda declarada:{" "}
            <span className="font-mono font-semibold text-zinc-400">
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
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <AnimatedCurrency
                value={totalTaxImpact}
                className="font-mono text-5xl font-bold tracking-tighter text-tax-red sm:text-6xl lg:text-[4.5rem]"
              />
              <CopyButton text={BRL(totalTaxImpact)} />
            </motion.div>
          ) : (
            <div key="hero-empty" className="mt-2 space-y-2">
              {/* #7 — skeleton proporcional ao numero */}
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
            {/* #5 — badge de delta 2026 */}
            {delta2026 !== null && delta2026 > 0 && (
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: "#14B8A6",
                  borderColor: "#14B8A625",
                  background: "#14B8A608",
                }}
              >
                +{BRL(delta2026)} com IVA 2026
              </span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Stat Card — versao leve com breakdown de impostos
// ============================================================
interface TaxLineItem {
  label: string;
  value: string;
  color?: string;
}

interface StatCardProps {
  label: string;
  value: string | null;
  sub?: string | null;
  accent: string;
  emptyIcon: typeof ShoppingCart;
  emptyHint: string;
  layoutId: string;
  lines?: TaxLineItem[];
}

const StatCard = memo(function StatCard({
  label,
  value,
  sub,
  accent,
  emptyIcon: EmptyIcon,
  emptyHint,
  layoutId,
  lines,
}: StatCardProps) {
  // #8 — empty state melhorado
  if (!value) {
    return (
      <motion.div
        layout
        layoutId={layoutId}
        className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 select-none"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2">
          <EmptyIcon size={13} className="shrink-0 text-white/20" />
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
            {label}
          </p>
        </div>
        <div className="skeleton h-5 w-20 rounded" />
        <p className="text-[10px] leading-relaxed text-white/25">{emptyHint}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      layoutId={layoutId}
      className="flex flex-col gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <p className="font-mono text-xl font-bold tracking-tighter" style={{ color: accent }}>
          {value}
        </p>
        <CopyButton text={value} />
      </div>
      {sub && <p className="text-[11px] text-white/40">{sub}</p>}
      {lines && lines.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 border-t border-white/[0.06] pt-2">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-white/45">{line.label}</span>
              <div className="flex items-center gap-1">
                <span
                  className="font-mono text-[10px] font-semibold tabular-nums"
                  style={{ color: line.color ?? "rgba(255,255,255,0.5)" }}
                >
                  {line.value}
                </span>
                <CopyButton text={line.value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

// ============================================================
// Termometro do Orcamento — Arrecadacao vs. Investimento Real
// ============================================================
function BudgetThermometer({ totalTaxImpact }: { totalTaxImpact: number }) {
  const hasData = totalTaxImpact > 0;
  const trail = hasData ? computeTaxTrail(totalTaxImpact) : null;

  const returnItem = BUDGET_DISTRIBUTION[BUDGET_DISTRIBUTION.length - 1];
  const stateCostPct = Math.round((1 - returnItem.percentage) * 100);
  const returnPct = Math.round(returnItem.percentage * 100);

  const returnAmount = trail ? trail[trail.length - 1].amount : null;
  const stateCostAmount = trail ? totalTaxImpact - (returnAmount ?? 0) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">
            Arrecadacao vs. Investimento Real
          </p>
          <p className="mt-0.5 text-[11px] text-white/35">
            Onde vai cada R$1 dos seus impostos
          </p>
        </div>
        <div className="group relative shrink-0">
          <Info size={12} className="cursor-help text-white/35 hover:text-white/55" />
          <div className="pointer-events-none absolute right-0 top-5 z-10 w-60 rounded-xl border border-white/[0.07] bg-zinc-900 p-3 text-[11px] text-white/50 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            Distribuicao estimada da arrecadacao federal (STN/SOF 2024). Valores variam
            conforme composicao do tributo.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex h-5 overflow-hidden rounded-full">
          <div style={{ width: `${stateCostPct}%`, background: "#EF444450" }} />
          <div style={{ width: `${returnPct}%`, background: "#10B981" }} />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] font-medium text-tax-red/70">
            {stateCostPct}% — Custo do Estado
          </span>
          <span className="text-[10px] font-bold text-citizen-green">
            {returnPct}% — Retorno Real
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {BUDGET_DISTRIBUTION.map((item, i) => {
          const trailItem = trail?.[i];
          return (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-[6px] w-[6px] shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 text-[11px] text-white/50">{item.label}</span>
              <span className="font-mono text-[11px] font-bold tabular-nums text-white/55">
                {hasData && trailItem
                  ? BRL(trailItem.amount)
                  : `${(item.percentage * 100).toFixed(0)}%`}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: "#EF444412", border: "1px solid #EF444428" }}
      >
        <p className="text-[10px] leading-relaxed text-white/35">
          Para cada{" "}
          <span className="font-mono font-bold text-white/50">
            {hasData ? BRL(totalTaxImpact) : "R$100"}
          </span>{" "}
          em impostos, apenas{" "}
          <span className="font-bold text-citizen-green">
            {hasData && returnAmount ? BRL(returnAmount) : "R$15"}
          </span>{" "}
          voltam como servico publico real.{" "}
          <span className="text-tax-red">
            {hasData && stateCostAmount ? BRL(stateCostAmount) : "R$85"}
          </span>{" "}
          financiam Estado, juros e previdencia.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Dia da Liberdade Fiscal
// ============================================================
function TaxFreedomDayCard({ salaryResult }: { salaryResult: SalaryBreakdown | null }) {
  if (!salaryResult) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="shrink-0 text-white/40" />
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">
            Dia da Liberdade Fiscal
          </p>
        </div>
        <div className="skeleton h-7 w-40 rounded-lg" />
        <p className="text-[11px] text-white/35">
          Informe sua renda para calcular o dia em que voce para de trabalhar para o governo.
        </p>
        <div className="skeleton-dim h-[3px] w-full rounded-full" />
      </div>
    );
  }

  const taxRate = salaryResult.effectiveTotalRate;
  const dayOfYear = Math.ceil(taxRate * 365);
  const date = new Date(2026, 0, 1);
  date.setDate(date.getDate() + dayOfYear - 1);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      <div className="flex items-center gap-2">
        <Calendar size={13} className="shrink-0 text-white/40" />
        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">
          Dia da Liberdade Fiscal
        </p>
      </div>

      <div>
        <p className="font-mono text-2xl font-bold tracking-tighter text-tax-red">{dateStr}</p>
        <p className="mt-0.5 text-[11px] text-white/45">Dia {dayOfYear} de 2026</p>
      </div>

      <p className="text-[11px] leading-relaxed text-white/35">
        Ate esta data, cada centavo que voce ganhou foi para o governo.
      </p>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/40">Carga efetiva total</span>
        <span className="font-mono text-[12px] font-bold text-tax-red">{PCT(taxRate)}</span>
      </div>

      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(taxRate * 100, 100)}%`, background: "#EF444455" }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Funil Financeiro — Extrato da Verdade
// ============================================================
function SalaryFunnel() {
  const { salaryResult } = useAppContext();
  if (!salaryResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-white/55">Custo Total da Empresa</p>
          <p className="text-[10px] text-white/35">O que seu trabalho custa para o empregador.</p>
        </div>
        <p className="shrink-0 font-mono text-base font-bold tracking-tighter text-white/70">
          {BRL(salaryResult.realLaborCost)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-tax-red/80">− Socio Oculto</p>
          <p className="text-[10px] text-white/35">Encargos patronais + descontos no holerite.</p>
        </div>
        <p className="shrink-0 font-mono text-base font-bold tracking-tighter text-tax-red">
          {BRL(salaryResult.totalTaxBurden)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 pt-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-citizen-green">= Seu Bolso</p>
          <p className="text-[10px] text-white/35">Salario liquido que cai na sua conta.</p>
        </div>
        <p className="shrink-0 font-mono text-lg font-bold tracking-tighter text-citizen-green">
          {BRL(salaryResult.netSalary)}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================
// Explainer — A Ilusao do Salario Bruto
// ============================================================
const ILLUSION_STEPS = [
  {
    n: "1",
    title: "A Maleta — Seu Valor Real",
    body: "Para te pagar, a empresa desembolsa o Custo Total. Esse e o seu verdadeiro valor de mercado — o preco real que seu empregador paga pela sua hora de trabalho.",
  },
  {
    n: "2",
    title: "O Pedagio Invisivel",
    body: "Antes do dinheiro virar Salario Bruto, o Estado cobra impostos da empresa: INSS Patronal (20%), Sistema S (~5.8%), RAT e FGTS (8%). Voce nunca ve esse dinheiro, mas ele sai do seu valor.",
  },
  {
    n: "3",
    title: "O Pedagio Visivel",
    body: "Do que sobrou (o Salario Bruto), o Estado desconta novamente a sua parte do INSS e o IRPF progressivo direto na fonte — antes mesmo de cair na sua conta.",
  },
] as const;

function SalaryIllusionExplainer() {
  const { salaryResult } = useAppContext();
  const [open, setOpen] = useState<string | null>(null);

  if (!salaryResult) return null;

  return (
    <div className="flex flex-col">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
        Como o Estado pega o seu dinheiro
      </p>
      {ILLUSION_STEPS.map((step) => {
        const isOpen = open === step.n;
        return (
          <div key={step.n}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : step.n)}
              className="flex w-full items-center gap-3 py-2 text-left"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.12] font-mono text-[10px] font-bold text-white/45">
                {step.n}
              </span>
              <span className="flex-1 text-[12px] font-medium text-white/65">{step.title}</span>
              <ChevronDown
                size={11}
                className="shrink-0 text-white/40 transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key={`exp_${step.n}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="pb-3 pl-8 text-[11px] leading-relaxed text-white/55">
                    {step.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// #9 — Separador visual entre secoes
// ============================================================
function Divider() {
  return <div className="h-px bg-white/[0.05]" />;
}

// ============================================================
// Secao principal — Hub do Dashboard
// ============================================================
export function DashboardSection() {
  const { taxResult, salaryResult, utilityResult, totalTaxImpact, hasAnyResult, laborWorkHours } =
    useAppContext();

  async function handleShare() {
    try {
      const result = await shareImpact({
        totalTaxAmount: totalTaxImpact,
        taxRate: salaryResult?.effectiveTotalRate ?? null,
        laborWorkHours,
        context: "dashboard",
      });
      if (result === "copied") toast("Copiado para a area de transferencia");
    } catch {
      // usuario cancelou o share sheet — sem feedback necessario
    }
  }

  const hasSalary = salaryResult !== null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-background">
        {/* Hero Number */}
        <HeroNumber />

        {/* #9 — separador antes do funil (so quando ha salario) */}
        {hasSalary && <Divider />}

        {/* Funil Financeiro */}
        <SalaryFunnel />

        {/* #9 — separador antes do explainer */}
        {hasSalary && <Divider />}

        {/* Explainer */}
        <SalaryIllusionExplainer />

        {/* #9 — separador antes dos cards */}
        {hasSalary && <Divider />}

        {/* Cards de breakdown por categoria */}
        <LayoutGroup id="dashboard-cards">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              layoutId="card-consumo"
              label="Consumo"
              value={taxResult ? BRL(taxResult.totalTaxAmount) : null}
              sub={taxResult ? PCT(taxResult.effectiveTaxRate) + " do preco pago" : null}
              accent="#EF4444"
              emptyIcon={ShoppingCart}
              emptyHint="Abra Consumo no menu para calcular."
              lines={taxResult?.breakdown.map((b) => ({
                label: b.code,
                value: BRL(b.amountPaid),
                color: b.layer === "iva_teste" ? "#14B8A6" : "#EF444490",
              }))}
            />
            <StatCard
              layoutId="card-trabalho"
              label="Trabalho"
              value={salaryResult ? BRL(salaryResult.totalTaxBurden) : null}
              sub={
                salaryResult
                  ? PCT(salaryResult.effectiveTotalRate) + " do custo da empresa"
                  : null
              }
              accent="#3B82F6"
              emptyIcon={Briefcase}
              emptyHint="Informe sua renda no onboarding."
              lines={
                salaryResult
                  ? [
                      { label: "INSS Empregado", value: BRL(salaryResult.inssEmployee), color: "#EF444490" },
                      { label: "IRPF", value: BRL(salaryResult.irpfAmount), color: "#F8717190" },
                      { label: "Enc. Patronais", value: BRL(salaryResult.totalEmployerCost), color: "#3B82F690" },
                    ]
                  : undefined
              }
            />
            <StatCard
              layoutId="card-utilidades"
              label="Utilidades"
              value={utilityResult ? BRL(utilityResult.totalTaxAmount) : null}
              sub={
                utilityResult
                  ? PCT(utilityResult.totalTaxRate) + " da fatura " + utilityResult.type
                  : null
              }
              accent="#F59E0B"
              emptyIcon={Zap}
              emptyHint="Abra Utilidades no menu para calcular."
              lines={
                utilityResult
                  ? [
                      { label: "ICMS", value: BRL(utilityResult.icmsAmount), color: "#EF444490" },
                      {
                        label: "PIS + COFINS",
                        value: BRL(utilityResult.pisAmount + utilityResult.cofinsAmount),
                        color: "#F9731690",
                      },
                      ...(utilityResult.cosip
                        ? [{ label: utilityResult.cosip.label, value: BRL(utilityResult.cosip.amount), color: "#F59E0B90" }]
                        : []),
                    ]
                  : undefined
              }
            />
          </div>
        </LayoutGroup>

        {/* Termometro + Dia da Liberdade */}
        <div className="grid gap-4 sm:grid-cols-2">
          <BudgetThermometer totalTaxImpact={totalTaxImpact} />
          <TaxFreedomDayCard salaryResult={salaryResult} />
        </div>
      </div>

      {hasAnyResult && (
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 self-end rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] text-white/40 transition-all hover:border-white/12 hover:bg-white/[0.04] hover:text-white/60"
        >
          <Share2 size={12} className="shrink-0" />
          Compartilhar
        </button>
      )}

      {/* Hint quando nenhum resultado */}
      {!hasAnyResult && (
        <p className="text-[11px] text-white/30">
          Use o menu lateral para simular cada categoria.
        </p>
      )}
    </div>
  );
}
