"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAppContext } from "@/context/impact-context";

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

export function SalaryIllusionExplainer() {
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
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.10] font-mono text-[10px] font-bold text-white/45">
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
                  transition={{ duration: 0.2, ease: "easeInOut" }}
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
