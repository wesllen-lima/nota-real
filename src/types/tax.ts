export type TaxCode = "ICMS" | "PIS" | "COFINS" | "IPI" | "IBS" | "CBS";

// Entidades do glossario que nao sao tributos (instituicoes / conceitos)
export type ConceptCode = "IBPT" | "ALIQUOTA";

export type GlossaryCode = TaxCode | ConceptCode;

export type GovernmentLevel = "federal" | "estadual" | "municipal";

export type TaxRegime = "atual" | "reforma_2026";

// Camada fiscal — distingue itens legados de itens IVA teste
export type TaxLayer = "legado" | "iva_teste";

export type ProductCategory =
  | "alimentacao"
  | "eletronicos"
  | "combustivel"
  | "vestuario"
  | "servicos"
  | "geral";

export interface TaxCalculationInput {
  /** Valor pago pelo cidadao (preco bruto com todos os impostos embutidos) */
  grossPrice: number;
  productCategory: ProductCategory;
  regime: TaxRegime;
}

export interface GlossaryEntry {
  code: GlossaryCode;
  fullName: string;
  citizenDescription: string;
  governmentLevel: GovernmentLevel | null;
  isReformTax: boolean;
  replaces: TaxCode[];
  replacedBy: TaxCode[];
}

export interface TaxRate {
  code: TaxCode;
  rate: number;
  basis: "por_dentro" | "por_fora";
}

export interface TaxBreakdown {
  code: TaxCode;
  rate: number;
  amountPaid: number;
  effectivePercentage: number;
  governmentLevel: GovernmentLevel;
  glossary: GlossaryEntry;
  /** Camada fiscal: "legado" para sistema atual, "iva_teste" para CBS/IBS 2026 */
  layer: TaxLayer;
}

// Override externo de aliquotas (ex: vindas da API IBPT)
// Apenas para o sistema legado — IVA teste usa valores fixos da EC 132
export type ExternalTaxRates = Partial<
  Record<"atual", Partial<Record<ProductCategory, TaxRate[]>>>
>;

export interface HybridSummary {
  /** Total dos impostos legados (ICMS, PIS, COFINS, IPI) */
  legacyTaxAmount: number;
  /** Aliquota efetiva do sistema legado */
  legacyRate: number;
  /** Total dos impostos IVA de teste (CBS + IBS = 1%) */
  ivaTaxAmount: number;
  /** Aliquota efetiva do IVA de teste (0.01) */
  ivaRate: number;
}

export interface TaxCalculationResult {
  grossPrice: number;
  netPrice: number;
  totalTaxAmount: number;
  effectiveTaxRate: number;
  regime: TaxRegime;
  productCategory: ProductCategory;
  breakdown: TaxBreakdown[];
  relatedGlossary: GlossaryEntry[];
  /**
   * true quando o regime e reforma_2026.
   * Breakdown contem itens com layer "legado" E "iva_teste".
   * Total de impostos e MAIOR que no regime atual (legado + 1% IVA teste).
   */
  isHybrid: boolean;
  /** Apenas presente quando isHybrid == true. */
  hybridSummary?: HybridSummary;
}
