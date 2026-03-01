"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateSalaryBreakdown } from "@/lib/salary-engine";
import { useAppContext } from "@/context/impact-context";
import { toast } from "@/hooks/use-toast";
import { BRL } from "@/lib/utils";

type Regime = "CLT" | "MEI" | "PJ";

const REGIMES: Array<{ id: Regime; label: string; desc: string }> = [
  { id: "CLT", label: "CLT", desc: "Carteira assinada — INSS + IRPF retidos na fonte" },
  { id: "MEI", label: "MEI", desc: "Microempreendedor — DAS fixo + carga tributaria estimada" },
  { id: "PJ", label: "PJ", desc: "Pessoa Juridica — pro-labore + distribuicao de lucros" },
];

function parseBRL(input: string): number {
  const clean = input.replace(/R\$\s?/g, "").trim();
  // Suporta "5.000,00" (BR) e "5000" e "5000.50"
  const normalized = clean.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized);
}

export function OnboardingModal() {
  const { setSalaryResult, setRawSalary, salaryResult, setWorkRegime, consumoInputs, isDetectingLocation } = useAppContext();
  const [regime, setRegime] = useState<Regime>("CLT");
  const [salaryInput, setSalaryInput] = useState("");
  const [error, setError] = useState("");

  const open = salaryResult === null;

  function handleConfirm() {
    const salary = parseBRL(salaryInput);
    if (!salary || salary <= 0) {
      setError("Informe uma renda mensal valida (ex: 5.000,00)");
      return;
    }
    if (salary > 9_999_999) {
      setError("Valor excede o limite de processamento (R$ 9.999.999,00)");
      return;
    }
    try {
      const result = calculateSalaryBreakdown(salary);
      setSalaryResult(result);
      setRawSalary(salaryInput);
      setWorkRegime(regime);
      toast(`Socio oculto revelado — ${BRL(result.totalTaxBurden)} em encargos/mes`);
    } catch {
      setError("Valor invalido. Tente novamente.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/92 p-4 sm:items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-2xl sm:p-9"
          >
            {/* Header */}
            <div className="mb-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                Auditoria do Socio Oculto
              </p>
              <h1 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-white">
                Como voce produz riqueza?
              </h1>
              <p className="mt-2 text-[12px] leading-relaxed text-white/35">
                Uma pergunta. O Estado ja sabe a resposta. Agora voce tambem vai saber.
              </p>
              {/* Chip de geolocalização — lê estado detectado do contexto */}
              {isDetectingLocation ? (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/35">
                  <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-white/30" />
                  Detectando estado...
                </span>
              ) : consumoInputs.uf ? (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-citizen-green/20 bg-citizen-green/[0.06] px-2.5 py-1 text-[10px] font-medium text-citizen-green">
                  <span className="h-[5px] w-[5px] rounded-full bg-citizen-green" />
                  {consumoInputs.uf} detectado — ICMS regional via IBPT
                </span>
              ) : null}
            </div>

            {/* Regime selector */}
            <div className="mb-5 flex flex-col gap-2">
              {REGIMES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegime(r.id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-150 ${
                    regime === r.id
                      ? "border border-white/10 bg-white/[0.06]"
                      : "border border-transparent hover:border-white/[0.05] hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/20">
                    {regime === r.id && (
                      <span className="h-2 w-2 rounded-full bg-tax-red" />
                    )}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-white/75">{r.label}</p>
                    <p className="text-[10px] text-white/35">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Salary input */}
            <div className="mb-6">
              <label
                htmlFor="onboarding-salary"
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.13em] text-white/35"
              >
                Renda Mensal Bruta
              </label>
              <input
                id="onboarding-salary"
                type="text"
                inputMode="numeric"
                placeholder="R$ 5.000,00"
                value={salaryInput}
                onChange={(e) => {
                  setSalaryInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                }}
                className="input-field"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-2 text-[11px] text-tax-red"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-white py-3.5 text-[13px] font-bold text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Revelar o Socio Oculto
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
