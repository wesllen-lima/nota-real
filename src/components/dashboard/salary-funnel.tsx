"use client";

import { motion } from "framer-motion";
import { useAppContext } from "@/context/impact-context";
import { BRL } from "@/lib/utils";

export function SalaryFunnel() {
  const { salaryResult } = useAppContext();
  if (!salaryResult) return null;

  const { realLaborCost, totalTaxBurden, totalLaborProvisions, netSalary } = salaryResult;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-white/60">A Maleta — Seu Valor Real</p>
          <p className="text-[10px] text-white/30">
            Tudo que a empresa desembolsou pelo seu trabalho.
          </p>
        </div>
        <p className="shrink-0 font-mono text-base font-bold tracking-tighter text-white/70">
          {BRL(realLaborCost)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-tax-red/85">− O Socio Oculto</p>
          <p className="text-[10px] text-white/30">
            INSS Patronal + FGTS + Sistema S + RAT + INSS + IRPF.
          </p>
        </div>
        <p className="shrink-0 font-mono text-base font-bold tracking-tighter text-tax-red">
          {BRL(totalTaxBurden)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-amber-400/80">− Direitos Trabalhistas</p>
          {/* Ferias Art. 7o CF + 13o Salario Art. 7o VIII CF — nao sao tributos */}
          <p className="text-[10px] text-white/30">
            Ferias (11,11%) + 13o Salario (8,33%) — nao sao impostos.
          </p>
        </div>
        <p className="shrink-0 font-mono text-base font-bold tracking-tighter text-amber-400/70">
          {BRL(totalLaborProvisions)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 pt-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-citizen-green">= Seu Bolso</p>
          <p className="text-[10px] text-white/30">Salario liquido que cai na sua conta.</p>
        </div>
        <p className="shrink-0 font-mono text-lg font-bold tracking-tighter text-citizen-green">
          {BRL(netSalary)}
        </p>
      </div>
    </motion.div>
  );
}
