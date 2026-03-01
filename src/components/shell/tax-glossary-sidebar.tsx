"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { useAppContext } from "@/context/impact-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  BUDGET_DISTRIBUTION,
  EMPLOYEE_GLOSSARY,
  EMPLOYER_GLOSSARY,
} from "@/lib/salary-engine";

type TagType = "retido" | "invisivel" | "consumo" | "iva2026" | "destino";

interface GlossaryEntry {
  key: string;
  label: string;
  tag: TagType;
  color: string;
  text: string;
}

const TAG_LABELS: Record<TagType, string> = {
  retido: "retido",
  invisivel: "invisivel",
  consumo: "consumo",
  iva2026: "IVA 2026",
  destino: "destino",
};

const TAG_BG: Record<TagType, string> = {
  retido: "#EF444428",
  invisivel: "#3B82F628",
  consumo: "#F59E0B28",
  iva2026: "#14B8A628",
  destino: "#10B98128",
};

const SALARY_ENTRIES: GlossaryEntry[] = [
  {
    key: "inss_emp",
    label: "INSS",
    tag: "retido",
    color: "#EF4444",
    text: EMPLOYEE_GLOSSARY.INSS,
  },
  {
    key: "irpf",
    label: "IRPF",
    tag: "retido",
    color: "#F87171",
    text: EMPLOYEE_GLOSSARY.IRPF,
  },
  {
    key: "inss_pat",
    label: "INSS Patronal",
    tag: "invisivel",
    color: "#3B82F6",
    text: EMPLOYER_GLOSSARY.INSS_PATRONAL,
  },
  {
    key: "fgts",
    label: "FGTS",
    tag: "invisivel",
    color: "#8B5CF6",
    text: EMPLOYER_GLOSSARY.FGTS,
  },
  {
    key: "sistema_s",
    label: "Sistema S",
    tag: "invisivel",
    color: "#F59E0B",
    text: EMPLOYER_GLOSSARY.SISTEMA_S,
  },
  {
    key: "rat",
    label: "RAT",
    tag: "invisivel",
    color: "#60A5FA",
    text: EMPLOYER_GLOSSARY.RAT,
  },
];

const CONSUMPTION_ENTRIES: GlossaryEntry[] = [
  {
    key: "icms",
    label: "ICMS",
    tag: "consumo",
    color: "#EF4444",
    text:
      "Imposto sobre Circulacao de Mercadorias e Servicos — estadual, varia de 7% a 35% " +
      "conforme produto e UF. O maior arrecadador dos estados. Cobrado na cadeia produtiva, " +
      "mas o consumidor final paga o preco com ICMS embutido sem ver o valor separado na nota.",
  },
  {
    key: "pis",
    label: "PIS",
    tag: "consumo",
    color: "#F97316",
    text:
      "Programa de Integracao Social — contribuicao federal sobre o faturamento das empresas. " +
      "0,65% (cumulativo, Simples/Lucro Presumido) ou 1,65% (nao-cumulativo, Lucro Real). " +
      "Financia o seguro-desemprego e o abono salarial. Repassado ao preco final dos produtos.",
  },
  {
    key: "cofins",
    label: "COFINS",
    tag: "consumo",
    color: "#FB923C",
    text:
      "Contribuicao para o Financiamento da Seguridade Social — similar ao PIS, porem maior: " +
      "3% (cumulativo) ou 7,6% (nao-cumulativo). Financia saude, previdencia e assistencia social. " +
      "Junto com PIS, e a principal contribuicao sobre faturamento embutida nos precos.",
  },
  {
    key: "ipi",
    label: "IPI",
    tag: "consumo",
    color: "#FBBF24",
    text:
      "Imposto sobre Produtos Industrializados — federal, incide na saida da industria. " +
      "Aliquotas de 0% (alimentos essenciais) ate 300%+ (cigarro). " +
      "Veiculos: 7–25%; bebidas: 20–330%; perfumes: 35%. Seletividade constitucional.",
  },
];

const IVA_ENTRIES: GlossaryEntry[] = [
  {
    key: "cbs",
    label: "CBS",
    tag: "iva2026",
    color: "#14B8A6",
    text:
      "Contribuicao sobre Bens e Servicos — o IVA federal da Reforma Tributaria (EC 132/2023). " +
      "Em fase de teste 2026 com aliquota de 0,9%. Substituira PIS + COFINS ao longo de 2026–2032. " +
      "Nao-cumulativa por design. Em 2026, e empilhada sobre o sistema legado, nao o substituindo.",
  },
  {
    key: "ibs",
    label: "IBS",
    tag: "iva2026",
    color: "#0EA5E9",
    text:
      "Imposto sobre Bens e Servicos — o IVA subnacional (estados + municipios) da Reforma. " +
      "Em fase de teste 2026 com aliquota de 0,1%. Substituira ICMS + ISS na transicao. " +
      "Gerido pelo Comite Gestor do IBS. Aliquota definitiva estimada em 12–15% no regime pleno 2033+.",
  },
];

const DESTINATION_ENTRIES: GlossaryEntry[] = BUDGET_DISTRIBUTION.map((d) => ({
  key: `bd_${d.label}`,
  label: d.label,
  tag: "destino" as TagType,
  color: d.color,
  text: d.description,
}));

interface GlossarySectionProps {
  title: string;
  entries: GlossaryEntry[];
  openKey: string | null;
  onToggle: (key: string) => void;
}

function GlossarySection({ title, entries, openKey, onToggle }: GlossarySectionProps) {
  return (
    <div className="flex flex-col">
      <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {title}
      </p>
      {entries.map((entry) => {
        const isOpen = openKey === entry.key;
        return (
          <div key={entry.key}>
            <button
              type="button"
              onClick={() => onToggle(entry.key)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03] active:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/15"
            >
              <span
                className="mt-[1px] h-[6px] w-[6px] shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1 text-[12px] font-medium text-white/65">{entry.label}</span>
              <span
                className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em]"
                style={{ background: TAG_BG[entry.tag], color: "rgba(255,255,255,0.4)" }}
              >
                {TAG_LABELS[entry.tag]}
              </span>
              <ChevronDown
                size={11}
                className="shrink-0 text-white/35 transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key={`exp_${entry.key}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="mx-4 mb-2 rounded-xl p-3"
                    style={{
                      background: `${entry.color}10`,
                      border: `1px solid ${entry.color}25`,
                    }}
                  >
                    <p className="text-[11px] leading-relaxed text-white/55">{entry.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function TaxGlossarySidebar() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  function handleToggle(key: string) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-[320px] flex-col border-l border-white/[0.09] bg-zinc-950 md:flex">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-4">
        <BookOpen size={14} className="shrink-0 text-white/30" />
        <div>
          <p className="text-[12px] font-semibold text-white/60">Glossario da Indignacao</p>
          <p className="text-[10px] text-white/35">O que e e para onde vai</p>
        </div>
      </div>

      <div className="h-px shrink-0 bg-white/[0.05]" />

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        <GlossarySection
          title="Folha de Pagamento"
          entries={SALARY_ENTRIES}
          openKey={openKey}
          onToggle={handleToggle}
        />
        <div className="mx-4 my-2 h-px bg-white/[0.04]" />
        <GlossarySection
          title="Tributos de Consumo"
          entries={CONSUMPTION_ENTRIES}
          openKey={openKey}
          onToggle={handleToggle}
        />
        <div className="mx-4 my-2 h-px bg-white/[0.04]" />
        <GlossarySection
          title="IVA 2026 — Fase de Teste"
          entries={IVA_ENTRIES}
          openKey={openKey}
          onToggle={handleToggle}
        />
        <div className="mx-4 my-2 h-px bg-white/[0.04]" />
        <GlossarySection
          title="Destino dos Impostos"
          entries={DESTINATION_ENTRIES}
          openKey={openKey}
          onToggle={handleToggle}
        />
        <div className="h-4" />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/[0.05] px-4 py-3">
        <p className="text-[10px] leading-relaxed text-white/35">
          CBS e IBS em transicao 2026–2032 (EC 132/2023). Nao substituem o sistema legado em 2026.
        </p>
      </div>
    </aside>
  );
}
