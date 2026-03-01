import { z } from "zod";
import type { SocialEquivalence, SocialImpact } from "@/types/utility";
import { CguResponseSchema } from "@/types/utility";

// ============================================================
// LOA 2026 — Lei 14.903/2024 (publicada 30/01/2025)
// Valores aprovados pelo Congresso (em bilhoes de reais)
// Fonte: https://www.gov.br/orcamento/pt-br/loa/loa-2026
// ============================================================
const LOA_2026 = {
  totalBi: 6_540,                    // LOA 2026 — Lei 14.903/2024 (aprovada, R$ 6,54 Tri)
  saude:       { bi: 271.3, funcaoCodigo: "10", funcaoNome: "Saude" },
  educacao:    { bi: 233.7, funcaoCodigo: "12", funcaoNome: "Educacao" },
  seguranca:   { bi: 37,   funcaoCodigo: "06", funcaoNome: "Seguranca Publica" },
  previdencia: { bi: 1_146, funcaoCodigo: "09", funcaoNome: "Previdencia Social" },
  assistencia: { bi: 168,  funcaoCodigo: "08", funcaoNome: "Assistencia Social" },
  populacaoBrasil: 215_000_000,
} as const;

// Per capita mensal estimado (LOA 2026 / populacao brasileira)
export const LOA_PER_CAPITA_MENSAL = {
  saude:       (LOA_2026.saude.bi       * 1e9) / LOA_2026.populacaoBrasil / 12,
  educacao:    (LOA_2026.educacao.bi    * 1e9) / LOA_2026.populacaoBrasil / 12,
  seguranca:   (LOA_2026.seguranca.bi   * 1e9) / LOA_2026.populacaoBrasil / 12,
  previdencia: (LOA_2026.previdencia.bi * 1e9) / LOA_2026.populacaoBrasil / 12,
  assistencia: (LOA_2026.assistencia.bi * 1e9) / LOA_2026.populacaoBrasil / 12,
} as const;

// ============================================================
// Custos unitarios de servicos publicos (SUS/MEC/FNDE 2025/2026)
// Fontes: FNDE Portaria 6.014/2023, MS SIGTAP 2025, PNLD 2024
// ============================================================
export const UNIT_COSTS = {
  // Merenda escolar PNAE — ensino fundamental integral (FNDE portaria 2025)
  merendaEscolar: 1.57,
  // Consulta ambulatorial SUS (SIGTAP codigo 03.01.01.007-2)
  consultaSus: 10.0,
  // Hora de UTI adulto SUS (SIGTAP — media procedimentos intensivos)
  horaUti: 280.0,
  // Livro didatico PNLD (media por titulo 2024)
  livroPnld: 45.0,
  // Dose de vacina padrao NIP (media vacinas calendario basico)
  doseVacina: 12.0,
  // Hora de policiamento ostensivo (custo SENASP 2025 per capita)
  horaPolicia: 35.0,
} as const;

export function computeSocialImpact(monthlyTaxAmount: number): SocialImpact {
  const annual = monthlyTaxAmount * 12;

  const equivalences: SocialEquivalence[] = [
    {
      label: "Merenda Escolar",
      description: "refeicoes do PNAE (Ensino Fundamental Integral)",
      quantity: Math.floor(annual / UNIT_COSTS.merendaEscolar),
      unit: "refeicoes/ano",
      iconKey: "merenda",
      colorKey: "green",
    },
    {
      label: "Consultas no SUS",
      description: "consultas ambulatoriais pelo SIGTAP",
      quantity: Math.floor(annual / UNIT_COSTS.consultaSus),
      unit: "consultas/ano",
      iconKey: "consulta",
      colorKey: "blue",
    },
    {
      label: "Horas de UTI",
      description: "horas em leito de UTI adulto pelo SUS",
      quantity: Math.floor(annual / UNIT_COSTS.horaUti),
      unit: "horas/ano",
      iconKey: "uti",
      colorKey: "red",
    },
    {
      label: "Livros Didaticos",
      description: "titulos distribuidos pelo PNLD",
      quantity: Math.floor(annual / UNIT_COSTS.livroPnld),
      unit: "livros/ano",
      iconKey: "livro",
      colorKey: "blue",
    },
    {
      label: "Doses de Vacina",
      description: "vacinas do calendario basico NIP",
      quantity: Math.floor(annual / UNIT_COSTS.doseVacina),
      unit: "doses/ano",
      iconKey: "vacina",
      colorKey: "green",
    },
  ];

  return {
    totalMonthlyTax: monthlyTaxAmount,
    totalAnnualTax: annual,
    equivalences,
    loaSource: "LOA 2026 — PLDO 2026/SIOP · FNDE 2025 · SIGTAP/MS 2025",
  };
}

const GastosApiResponseSchema = z.object({
  saude:       z.number(),
  educacao:    z.number(),
  seguranca:   z.number(),
  previdencia: z.number(),
  assistencia: z.number(),
  source: z.enum(["cgu_live", "loa_2026_fallback"]),
});
export type GastosApiResponse = z.infer<typeof GastosApiResponseSchema>;

export async function fetchGastosPublicos(): Promise<GastosApiResponse> {
  try {
    const res = await fetch("/api/cgu/gastos", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`CGU API HTTP ${res.status}`);
    const raw: unknown = await res.json();
    return GastosApiResponseSchema.parse(raw);
  } catch {
    // Fallback para dados LOA 2026 estaticos
    return {
      saude:       LOA_PER_CAPITA_MENSAL.saude,
      educacao:    LOA_PER_CAPITA_MENSAL.educacao,
      seguranca:   LOA_PER_CAPITA_MENSAL.seguranca,
      previdencia: LOA_PER_CAPITA_MENSAL.previdencia,
      assistencia: LOA_PER_CAPITA_MENSAL.assistencia,
      source: "loa_2026_fallback",
    };
  }
}

export { CguResponseSchema, LOA_2026 };
