"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scan, CheckCircle2, XCircle } from "lucide-react";
import { useNfeScanner, type SimulatedItem } from "@/hooks/use-nfe-scanner";
import { LaborEffortCard } from "./labor-effort-card";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PCT = (v: number) => `${(v * 100).toFixed(1)}%`;

const CATEGORY_LABELS: Record<string, string> = {
  alimentacao: "Alimentacao",
  geral: "Geral",
  eletronicos: "Eletronicos",
  combustivel: "Combustivel",
  vestuario: "Vestuario",
  servicos: "Servicos",
};

// Formata 44 digitos em grupos de 4 para legibilidade
function formatKeyDisplay(digits: string): string {
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

// Converte AAMM em label legivel: "2601" -> "Jan/2026"
function formatAamm(aamm: string): string {
  const year = "20" + aamm.slice(0, 2);
  const monthIndex = parseInt(aamm.slice(2, 4), 10) - 1;
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[monthIndex] ?? aamm.slice(2, 4)}/${year}`;
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </span>
      <span className="font-mono text-[12px] font-semibold text-white/65">
        {value}
      </span>
    </div>
  );
}

function ItemRow({ item }: { item: SimulatedItem }) {
  const { taxResult } = item;
  const legacyAmount = taxResult.hybridSummary?.legacyTaxAmount ?? taxResult.totalTaxAmount;
  const ivaAmount = taxResult.hybridSummary?.ivaTaxAmount ?? 0;

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3 text-right">
      <div className="text-left">
        <p className="text-[12px] font-medium text-white/70">{item.xProd}</p>
        <p className="text-[10px] text-white/25">{CATEGORY_LABELS[item.category]}</p>
      </div>
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: "#EF444480" }}
      >
        {BRL(legacyAmount)}
      </span>
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: "#14B8A680" }}
      >
        +{BRL(ivaAmount)}
      </span>
      <span className="font-mono text-[12px] font-semibold tabular-nums text-tax-red">
        {BRL(taxResult.totalTaxAmount)}
      </span>
    </div>
  );
}

function ScannerSkeleton() {
  return (
    <div className="flex flex-col gap-4 select-none" aria-hidden="true">
      <div className="card-glass rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap gap-6">
          {[70, 90, 60, 80, 50].map((w, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="skeleton h-[9px] w-12 rounded" />
              <div
                className="skeleton h-[11px] rounded"
                style={{ width: w, animationDelay: `${i * 0.07}s` }}
              />
            </div>
          ))}
        </div>
        <div className="skeleton-dim h-px w-full rounded" />
        <div className="mt-4 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div
                  className="skeleton h-[10px] w-40 rounded"
                  style={{ animationDelay: `${i * 0.07}s` }}
                />
                <div className="skeleton-dim h-[9px] w-20 rounded" />
              </div>
              <div className="flex gap-4">
                {[16, 16, 20].map((w2, j) => (
                  <div
                    key={j}
                    className="skeleton h-[10px] rounded"
                    style={{
                      width: `${w2 * 4}px`,
                      animationDelay: `${(i * 3 + j) * 0.04}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NfeScanner() {
  const {
    state,
    handleInput,
    totalTaxAmount,
    totalGrossPrice,
    totalNetPrice,
  } = useNfeScanner();

  const charCount = state.rawInput.length;
  const displayValue = formatKeyDisplay(state.rawInput);

  const borderColor =
    state.status === "valid"
      ? "#10B98130"
      : state.status === "invalid"
      ? "#EF444430"
      : undefined;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Input da chave */}
      <div className="card-glass w-full rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan size={14} style={{ color: "#3B82F6", opacity: 0.6 }} />
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
              Chave de Acesso NF-e
            </p>
          </div>
          <span
            className="font-mono text-[11px] transition-colors"
            style={{ color: charCount === 44 ? "#10B981" : "oklch(1 0 0 / 20%)" }}
          >
            {charCount}/44
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={(e) =>
              handleInput(e.target.value.replace(/\D/g, "").slice(0, 44))
            }
            placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
            className="input-field pr-10 font-mono text-[13px] tracking-wider"
            style={{ borderColor }}
          />
          <AnimatePresence>
            {state.status !== "idle" && (
              <motion.div
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
              >
                {state.status === "valid" ? (
                  <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                ) : (
                  <XCircle size={16} style={{ color: "#EF4444" }} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {state.errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-2 text-[11px] text-tax-red/60"
            >
              {state.errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {charCount === 0 && (
          <p className="mt-2 text-[11px] text-white/20">
            Cole a chave de 44 digitos da sua nota fiscal para ver a analise
            tributaria completa com o motor hibrido 2026.
          </p>
        )}
      </div>

      {/* Resultados */}
      <AnimatePresence mode="wait">
        {state.status === "valid" && state.parsedKey ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {/* Metadados da chave */}
            <div className="card-glass rounded-2xl p-5">
              <div className="mb-4 flex flex-wrap gap-x-6 gap-y-3">
                <MetaChip
                  label="Estado"
                  value={state.uf ?? state.parsedKey.cUF}
                />
                <MetaChip
                  label="Modelo"
                  value={
                    state.parsedKey.modelo === "55" ? "NF-e (55)" : "NFC-e (65)"
                  }
                />
                <MetaChip
                  label="Emissao"
                  value={formatAamm(state.parsedKey.aamm)}
                />
                <MetaChip
                  label="CNPJ"
                  value={`••• ${state.parsedKey.cnpjEmitente.slice(-6)}`}
                />
                <MetaChip label="Serie" value={state.parsedKey.serie} />
              </div>

              <div
                className="rounded-lg px-3 py-2 text-[10px] leading-relaxed text-white/30"
                style={{
                  background: "#3B82F605",
                  border: "1px solid #3B82F615",
                }}
              >
                <span style={{ color: "#3B82F680" }}>
                  Simulacao educacional —
                </span>{" "}
                Itens gerados deterministicamente a partir da estrutura da
                chave. Consulta SEFAZ em tempo real sera integrada em sprint
                futura.
              </div>
            </div>

            {/* Tabela de itens */}
            <div className="card-glass rounded-2xl p-5">
              {/* Header da tabela */}
              <div className="mb-2 flex items-center gap-2">
                <p className="flex-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                  Itens da Nota — Raio-X Tributario
                </p>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-[4px] w-3 rounded-full"
                      style={{ background: "#EF4444", opacity: 0.5 }}
                    />
                    <span className="text-white/25">Legado</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-[4px] w-3 rounded-full"
                      style={{ background: "#14B8A6", opacity: 0.5 }}
                    />
                    <span className="text-white/25">IVA Teste</span>
                  </span>
                </div>
              </div>

              {/* Cabecalho de colunas */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-white/[0.04] pb-2 text-right">
                <span className="text-left text-[10px] text-white/20">
                  Produto
                </span>
                <span className="text-[10px]" style={{ color: "#EF444450" }}>
                  Legado
                </span>
                <span className="text-[10px]" style={{ color: "#14B8A650" }}>
                  IVA
                </span>
                <span className="text-[10px] text-white/20">Total Imp.</span>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {state.items.map((item) => (
                  <ItemRow key={item.nItem} item={item} />
                ))}
              </div>

              {/* Totais */}
              <div
                className="mt-4 grid grid-cols-3 gap-3 rounded-xl p-4"
                style={{
                  background: "oklch(0.14 0 0 / 60%)",
                  border: "1px solid oklch(1 0 0 / 5%)",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">
                    Total Pago
                  </span>
                  <span className="font-mono text-[13px] font-bold tracking-tighter text-white/70">
                    {BRL(totalGrossPrice)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">
                    Impostos
                  </span>
                  <span className="font-mono text-[13px] font-bold tracking-tighter text-tax-red">
                    {BRL(totalTaxAmount)}
                  </span>
                  <span className="font-mono text-[10px] text-white/25">
                    {totalGrossPrice > 0
                      ? PCT(totalTaxAmount / totalGrossPrice)
                      : "0%"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">
                    Valor Real
                  </span>
                  <span className="font-mono text-[13px] font-bold tracking-tighter text-citizen-green">
                    {BRL(totalNetPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card de esforco laboral */}
            <LaborEffortCard totalTaxAmount={totalTaxAmount} />
          </motion.div>
        ) : state.status === "idle" && charCount > 0 && charCount < 44 ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ScannerSkeleton />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
