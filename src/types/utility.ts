import { z } from "zod";

export type UtilityType = "energia" | "agua";
export type InputMode = "manual" | "simulado";

// Esquema de entrada — validado via Zod
export const UtilityInputSchema = z.object({
  type: z.enum(["energia", "agua"]),
  totalValue: z.number().positive("Valor deve ser maior que zero"),
  inputMode: z.enum(["manual", "simulado"]),
  uf: z.string().length(2).optional(),
  regime: z.enum(["atual", "reforma_2026"]).default("atual"),
  /** Aliquota ICMS obtida dinamicamente via IBPT (0..1). Se ausente, usa media nacional. */
  icmsRate: z.number().min(0).max(1).optional(),
});
export type UtilityInput = z.infer<typeof UtilityInputSchema>;

export interface UtilityTaxRates {
  icms: number;
  pis: number;
  cofins: number;
}

// Imposto em cascata — ICMS tributando PIS+COFINS "por dentro"
export interface CascadeTax {
  /** Parcela do ICMS que incide sobre PIS e COFINS */
  amount: number;
  /** Percentual do cascata em relacao ao total da fatura */
  percentageOfBill: number;
  icmsRate: number;
  pisCofinsRate: number;
}

// Taxa de iluminacao publica — cobrada somente na conta de energia
export interface CosipEntry {
  amount: number;
  label: string;
  isEstimated: boolean;
}

export interface UtilityTaxResult {
  type: UtilityType;
  totalValue: number;
  inputMode: InputMode;
  regime: "atual" | "reforma_2026";
  icmsAmount: number;
  icmsRate: number;
  pisAmount: number;
  pisRate: number;
  cofinsAmount: number;
  cofinsRate: number;
  cosip: CosipEntry | null;
  cascade: CascadeTax;
  totalTaxAmount: number;
  totalTaxRate: number;
  netValue: number;
  // Camada IVA 2026 (apenas reforma_2026)
  isHybrid: boolean;
  cbsAmount: number;
  ibsAmount: number;
  hybridExtraTax: number;
}

export interface RegionalAverage {
  uf: string;
  municipio: string;
  avgEnergia: number;
  avgAgua: number;
  cosipEstimated: number;
}

// Schema Zod para validar resposta da API CGU (Portal Transparencia)
export const CguGastoSchema = z.object({
  funcao: z.object({
    codigo: z.string(),
    descricao: z.string(),
  }),
  valorEmpenhado: z.string().or(z.number()),
  valorLiquidado: z.string().or(z.number()),
  valorPago: z.string().or(z.number()),
});
export type CguGasto = z.infer<typeof CguGastoSchema>;

export const CguResponseSchema = z.array(CguGastoSchema);

export interface SocialImpact {
  totalMonthlyTax: number;
  totalAnnualTax: number;
  equivalences: SocialEquivalence[];
  loaSource: string;
}

export interface SocialEquivalence {
  label: string;
  description: string;
  quantity: number;
  unit: string;
  iconKey: "merenda" | "uti" | "livro" | "policia" | "vacina" | "consulta";
  colorKey: "green" | "blue" | "red";
}

// Estado de formulario da secao Utilidades (persistido no context)
export interface UtilityFormInputs {
  activeTab: UtilityType;
  inputMode: InputMode;
  valueStr: string;
  regime: "atual" | "reforma_2026";
}
