"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Droplets,
  AlertTriangle,
  Info,
  TrendingUp,
  BookOpen,
  HeartPulse,
  Shield,
  Syringe,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { Tooltip } from "radix-ui";
import { useUtilityCalculator } from "@/hooks/use-utility-calculator";
import { useAppContext } from "@/context/impact-context";
import { computeSocialImpact } from "@/services/transparencia";
import { UtilityStackedBar } from "@/components/charts/utility-stacked-bar";
import type { SocialEquivalence, UtilityTaxResult } from "@/types/utility";

// ============================================================
// Formatacao
// ============================================================
const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

const NUM = (v: number) =>
  new Intl.NumberFormat("pt-BR").format(Math.floor(v));

// ============================================================
// Icones de equivalencia social
// ============================================================
const ICON_MAP = {
  merenda: BookOpen,
  consulta: Stethoscope,
  uti: HeartPulse,
  livro: BookOpen,
  vacina: Syringe,
  policia: Shield,
} as const;

const COLOR_MAP = {
  green: { text: "text-citizen-green", bg: "bg-citizen-green/10", dot: "bg-citizen-green" },
  blue: { text: "text-gov-blue", bg: "bg-gov-blue/10", dot: "bg-gov-blue" },
  red: { text: "text-tax-red", bg: "bg-tax-red/10", dot: "bg-tax-red" },
} as const;

// ============================================================
// Tooltip padrao
// ============================================================
const TOOLTIP_STYLE = {
  background:
    "oklch(0.187 0 0 / 97%) padding-box, linear-gradient(135deg, oklch(1 0 0 / 9%) 0%, oklch(1 0 0 / 0%) 100%) border-box",
  border: "1px solid transparent",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button className="text-white/25 hover:text-white/50 transition-colors">
          <Info size={12} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={8}
          className="z-50 max-w-[260px] rounded-xl p-3 text-[11px] leading-relaxed text-white/70 shadow-2xl"
          style={TOOLTIP_STYLE}
        >
          {text}
          <Tooltip.Arrow className="fill-zinc-900/90" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// ============================================================
// Linha de imposto individual
// ============================================================
function TaxRow({
  label,
  rate,
  amount,
  level,
  highlight,
  tooltip,
}: {
  label: string;
  rate: number;
  amount: number;
  level: "federal" | "estadual" | "municipal";
  highlight?: boolean;
  tooltip?: string;
}) {
  const dotColor =
    level === "federal" ? "bg-gov-blue" : level === "estadual" ? "bg-tax-red" : "bg-amber-500";

  return (
    <div
      className={`flex items-center justify-between py-2.5 ${highlight ? "rounded-lg px-2 ring-1 ring-amber-500/20 bg-amber-500/5" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="text-[13px] text-white/60 font-medium">{label}</span>
        {tooltip && <InfoTip text={tooltip} />}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-white/30 font-mono">{PCT(rate)}</span>
        <span className="text-[13px] font-mono font-bold text-white/80 tabular-nums">
          {BRL(amount)}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Card de alerta — Imposto em Cascata
// ============================================================
function CascadeAlert({ result }: { result: UtilityTaxResult }) {
  const { cascade } = result;
  if (cascade.amount <= 0.01) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl p-4"
      style={{
        background:
          "oklch(0.18 0.02 25 / 60%) padding-box, linear-gradient(135deg, #ef444420 0%, oklch(1 0 0 / 0%) 100%) border-box",
        border: "1px solid transparent",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-tax-red" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-tax-red mb-1">
            Imposto em Cascata Detectado
          </p>
          <p className="text-[11px] leading-relaxed text-white/45">
            O ICMS ({PCT(cascade.icmsRate)}) incide sobre uma base que ja contem PIS e COFINS (
            {PCT(cascade.pisCofinsRate)}). Isso gera{" "}
            <span className="text-white/70 font-mono font-bold">{BRL(cascade.amount)}</span> extras
            ({cascade.percentageOfBill.toFixed(1)}% da fatura) de imposto tributando imposto.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Nota do Regime 2026
// ============================================================
function HybridNote({ result }: { result: UtilityTaxResult }) {
  if (!result.isHybrid) return null;

  return (
    <div className="rounded-xl p-3 bg-teal-500/5 ring-1 ring-teal-500/15">
      <p className="text-[11px] text-teal-400/80 leading-relaxed">
        <span className="font-medium">IVA Dual — Fase de Teste (EC 132/2023):</span>{" "}
        CBS 0,9% + IBS 0,1% ={" "}
        <span className="font-mono font-bold">{BRL(result.hybridExtraTax)}</span> adicionais.
        O sistema legado (ICMS/PIS/COFINS) permanece 100% ativo. A simplificacao ocorre entre 2029 e 2033.
      </p>
    </div>
  );
}

// ============================================================
// Painel do Rastro Social
// ============================================================
function SocialTrail({ monthlyTax }: { monthlyTax: number }) {
  const impact = computeSocialImpact(monthlyTax);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card-glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} className="text-citizen-green" />
        <h3 className="text-[13px] font-medium text-white/70">Rastro Social do Imposto</h3>
        <InfoTip
          text={`Baseado na LOA 2026 (Lei 14.903/2024). Seu imposto anual estimado de ${BRL(impact.totalAnnualTax)} equivale aos servicos publicos abaixo.`}
        />
      </div>

      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-[11px] text-white/35">Imposto mensal nesta conta:</span>
        <span className="font-mono font-bold text-tax-red text-[15px]">
          {BRL(monthlyTax)}
        </span>
        <span className="text-[11px] text-white/25">
          · {BRL(impact.totalAnnualTax)}/ano
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {impact.equivalences.slice(0, 4).map((eq) => (
          <EquivalenceCard key={eq.iconKey} eq={eq} />
        ))}
      </div>

      <p className="mt-4 text-[10px] text-white/20 leading-relaxed">
        {impact.loaSource}
      </p>
    </motion.div>
  );
}

function EquivalenceCard({ eq }: { eq: SocialEquivalence }) {
  const Icon = ICON_MAP[eq.iconKey];
  const color = COLOR_MAP[eq.colorKey];

  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 ${color.bg} ring-1 ring-white/[0.04]`}>
      <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${color.bg}`}>
        <Icon size={13} className={color.text} />
      </div>
      <div className="min-w-0">
        <p className={`text-[12px] font-bold font-mono tabular-nums ${color.text}`}>
          {NUM(eq.quantity)}
        </p>
        <p className="text-[10px] text-white/40 leading-snug mt-0.5">
          {eq.label}
        </p>
        <p className="text-[9px] text-white/25 leading-snug">
          {eq.description}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Resultado do calculo
// ============================================================
function UtilityResult({ result }: { result: UtilityTaxResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Resumo visual */}
      <div className="card-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] uppercase tracking-widest text-white/30">
            {result.type === "energia" ? "Conta de Energia" : "Conta de Agua"}
            {result.inputMode === "simulado" && (
              <span className="ml-2 text-amber-400/60">(media RO)</span>
            )}
          </p>
          {result.isHybrid && (
            <span className="chip-glass rounded-full px-2.5 py-1 text-[9px] uppercase tracking-widest text-teal-400/70">
              Hibrido 2026
            </span>
          )}
        </div>

        {/* Barra visual segmentada */}
        <div className="mb-4">
          <UtilityStackedBar result={result} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] text-white/30 mb-0.5">Total pago</p>
            <p className="font-mono font-bold text-2xl text-white tracking-tighter">
              {BRL(result.totalValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-tax-red/70 mb-0.5">Impostos</p>
            <p className="font-mono font-bold text-xl text-tax-red tracking-tighter">
              {BRL(result.totalTaxAmount)}
            </p>
            <p className="text-[10px] text-white/25 font-mono">
              {PCT(result.totalTaxRate)} do valor
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-white/30">Valor sem impostos</span>
          <span className="font-mono font-bold text-citizen-green text-[14px]">
            {BRL(result.netValue)}
          </span>
        </div>
      </div>

      {/* Breakdown de tributos */}
      <div className="card-glass rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">
          Sistema Legado
        </p>

        <div className="divide-y divide-white/[0.04]">
          {result.icmsRate > 0 && (
            <TaxRow
              label="ICMS"
              rate={result.icmsRate}
              amount={result.icmsAmount}
              level="estadual"
              tooltip="Imposto Estadual sobre Circulacao de Mercadorias. Em energia eletrica, incide sobre a base que ja contem PIS e COFINS — gerando o imposto em cascata."
            />
          )}
          <TaxRow
            label="PIS"
            rate={result.pisRate}
            amount={result.pisAmount}
            level="federal"
            tooltip="Programa de Integracao Social — federal. Entra na base de calculo do ICMS, gerando tributacao sobre tributacao."
          />
          <TaxRow
            label="COFINS"
            rate={result.cofinsRate}
            amount={result.cofinsAmount}
            level="federal"
            tooltip="Contribuicao para o Financiamento da Seguridade Social — federal. Junto com PIS, compoe a base tributada pelo ICMS em cascata."
          />
          {result.cosip && (
            <TaxRow
              label={result.cosip.label}
              rate={result.cosip.amount / result.totalValue}
              amount={result.cosip.amount}
              level="municipal"
              tooltip="Taxa municipal cobrada na conta de energia para custear a iluminacao publica. Nao e percentual fixo — e um valor nominal definido pelo municipio."
            />
          )}
        </div>

        {/* Camada IVA 2026 */}
        {result.isHybrid && (
          <>
            <div className="my-3 border-t border-white/5 pt-3">
              <p className="text-[11px] uppercase tracking-widest text-teal-400/50 mb-1">
                IVA Dual — Fase de Teste
              </p>
              <div className="divide-y divide-white/[0.04]">
                <TaxRow label="CBS" rate={0.009} amount={result.cbsAmount} level="federal" />
                <TaxRow label="IBS" rate={0.001} amount={result.ibsAmount} level="estadual" />
              </div>
            </div>
          </>
        )}
      </div>

      <CascadeAlert result={result} />
      <HybridNote result={result} />
      <SocialTrail monthlyTax={result.totalTaxAmount} />
    </motion.div>
  );
}

// ============================================================
// Componente principal — UtilityScanner
// ============================================================
export function UtilityScanner({ onResult }: { onResult?: (r: UtilityTaxResult) => void }) {
  const { utilityInputs, setUtilityInputs } = useAppContext();
  const { activeTab, inputMode, valueStr, regime } = utilityInputs;
  const inputRef = useRef<HTMLInputElement>(null);

  const { result, error, isCalculating, calculate, simulateRegional, reset } =
    useUtilityCalculator();

  useEffect(() => {
    if (result) onResult?.(result);
  }, [result, onResult]);

  function switchTab(tab: "energia" | "agua") {
    setUtilityInputs({ ...utilityInputs, activeTab: tab, valueStr: "" });
    reset();
  }

  function switchMode(mode: "manual" | "simulado") {
    setUtilityInputs({ ...utilityInputs, inputMode: mode, valueStr: "" });
    reset();
  }

  function setValueStr(v: string) {
    setUtilityInputs({ ...utilityInputs, valueStr: v });
  }

  function setRegime(r: "atual" | "reforma_2026") {
    setUtilityInputs({ ...utilityInputs, regime: r });
  }

  function handleCalculate() {
    if (inputMode === "simulado") {
      simulateRegional(activeTab, "RO", regime);
    } else {
      const val = parseFloat(valueStr.replace(",", "."));
      calculate({ type: activeTab, totalValue: val, inputMode: "manual", uf: "RO", regime });
    }
  }

  const tabs: { key: "energia" | "agua"; label: string; Icon: typeof Zap }[] = [
    { key: "energia", label: "Energia Eletrica", Icon: Zap },
    { key: "agua", label: "Agua / Esgoto", Icon: Droplets },
  ];

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="w-full max-w-lg">
        <div className="card-glass rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <TrendingUp size={15} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-white/80">Scanner de Contas</h2>
              <p className="text-[11px] text-white/30">ICMS em cascata · COSIP · Rastro Social</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1 mb-5">
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-all ${
                  activeTab === key
                    ? "bg-white/[0.07] text-white/80 shadow-sm"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Modo de input */}
          <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1 mb-5">
            {(["simulado", "manual"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-all ${
                  inputMode === m
                    ? "bg-white/[0.07] text-white/80"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {m === "simulado" ? "Simular (media RO)" : "Inserir valor"}
              </button>
            ))}
          </div>

          {/* Input manual */}
          <AnimatePresence>
            {inputMode === "manual" && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <label className="block text-[11px] text-white/35 mb-2">
                  Valor total da fatura (R$)
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.01"
                  placeholder="Ex: 187,40"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  className="input-field font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Regime */}
          <div className="mb-5">
            <label className="block text-[11px] text-white/35 mb-2">Regime tributario</label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value as typeof regime)}
              className="select-field font-mono text-[12px]"
            >
              <option value="atual">Sistema Atual (2025)</option>
              <option value="reforma_2026">Hibrido 2026 — Legado + IVA Teste</option>
            </select>
          </div>

          {/* Nota simulacao */}
          {inputMode === "simulado" && (
            <p className="mb-4 text-[11px] text-white/25 leading-relaxed">
              Simulando com medias regionais de Porto Velho / RO: energia R$ 180/mes
              (250 kWh, Bandeira Verde ENERGISA), agua R$ 72/mes (15 m3, CAERD 2025).
            </p>
          )}

          {/* Botao calcular */}
          <button
            onClick={handleCalculate}
            disabled={isCalculating || (inputMode === "manual" && !valueStr)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.07] py-3 text-[13px] font-medium text-white/80 ring-1 ring-white/10 transition-all hover:bg-white/[0.10] hover:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCalculating ? "Calculando..." : "Calcular Impostos"}
            {!isCalculating && <ChevronRight size={14} />}
          </button>

          {error && (
            <p className="mt-3 text-[12px] text-tax-red/80">{error}</p>
          )}
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <UtilityResult result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tooltip.Provider>
  );
}
