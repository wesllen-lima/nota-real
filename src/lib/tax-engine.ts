import type {
  GlossaryCode,
  GlossaryEntry,
  ExternalTaxRates,
  GovernmentLevel,
  HybridSummary,
  ProductCategory,
  TaxBreakdown,
  TaxCalculationInput,
  TaxCalculationResult,
  TaxCode,
  TaxLayer,
  TaxRate,
  TaxRegime,
} from "@/types/tax";

// ============================================================
// Glossario para o Cidadao
// ============================================================
const CITIZEN_GLOSSARY: Record<GlossaryCode, GlossaryEntry> = {
  ICMS: {
    code: "ICMS",
    fullName: "Imposto sobre Circulacao de Mercadorias e Servicos",
    citizenDescription:
      "O imposto que o estado cobra sobre quase tudo que voce compra ou consome (gasolina, arroz, energia). " +
      "A aliquota varia de estado para estado e costuma ser a maior fatia do imposto no seu carrinho de compras. " +
      "Continuara em vigor ate pelo menos 2033 durante a transicao da Reforma Tributaria.",
    governmentLevel: "estadual",
    isReformTax: false,
    replaces: [],
    replacedBy: ["IBS"],
  },
  PIS: {
    code: "PIS",
    fullName: "Programa de Integracao Social",
    citizenDescription:
      "Imposto federal que financia o seguro-desemprego e o abono salarial. " +
      "Voce o paga embutido no preco de quase tudo que compra. " +
      "Sera extinto progressivamente entre 2029 e 2033, substituido pela CBS.",
    governmentLevel: "federal",
    isReformTax: false,
    replaces: [],
    replacedBy: ["CBS"],
  },
  COFINS: {
    code: "COFINS",
    fullName: "Contribuicao para o Financiamento da Seguridade Social",
    citizenDescription:
      "Imposto federal que financia saude publica, previdencia e assistencia social. " +
      "Junto com o PIS, e cobrado de forma invisivel dentro do preco final. " +
      "Sera extinto progressivamente entre 2029 e 2033.",
    governmentLevel: "federal",
    isReformTax: false,
    replaces: [],
    replacedBy: ["CBS"],
  },
  IPI: {
    code: "IPI",
    fullName: "Imposto sobre Produtos Industrializados",
    citizenDescription:
      "Imposto cobrado sobre produtos que saem das fabricas. Quanto mais industrializado " +
      "(eletronicos, cigarros, bebidas), maior a aliquota. Sera extinto ate 2033.",
    governmentLevel: "federal",
    isReformTax: false,
    replaces: [],
    replacedBy: ["CBS"],
  },
  IBS: {
    code: "IBS",
    fullName: "Imposto sobre Bens e Servicos",
    citizenDescription:
      "O novo imposto subnacional da Reforma Tributaria para substituir o ICMS e o ISS. " +
      "Em 2026 opera em MODO DE TESTE com aliquota de apenas 0,1%, coexistindo com o ICMS pleno. " +
      "A substituicao completa ocorre entre 2029 e 2032 — em 2026 voce paga AMBOS.",
    governmentLevel: "estadual",
    isReformTax: true,
    replaces: ["ICMS"],
    replacedBy: [],
  },
  CBS: {
    code: "CBS",
    fullName: "Contribuicao sobre Bens e Servicos",
    citizenDescription:
      "O novo imposto federal da Reforma Tributaria para substituir PIS e COFINS. " +
      "Em 2026 opera em MODO DE TESTE com aliquota de 0,9%, coexistindo com o PIS e o COFINS plenos. " +
      "Junto com o IBS forma o IVA Dual, mas a transicao leva de 2026 a 2032 para ser concluida.",
    governmentLevel: "federal",
    isReformTax: true,
    replaces: ["PIS", "COFINS", "IPI"],
    replacedBy: [],
  },
  IBPT: {
    code: "IBPT",
    fullName: "Instituto Brasileiro de Planejamento e Tributacao",
    citizenDescription:
      "A instituicao que calcula e divulga quanto de imposto existe em cada produto vendido no Brasil. " +
      "As tabelas do IBPT sao a base das estimativas de carga tributaria exibidas em notas fiscais.",
    governmentLevel: null,
    isReformTax: false,
    replaces: [],
    replacedBy: [],
  },
  ALIQUOTA: {
    code: "ALIQUOTA",
    fullName: "Aliquota Tributaria",
    citizenDescription:
      "A porcentagem que o governo retira do valor total de um produto. " +
      "Uma aliquota de 18% de ICMS significa que R$ 18 de cada R$ 100 pagos foram para o governo estadual.",
    governmentLevel: null,
    isReformTax: false,
    replaces: [],
    replacedBy: [],
  },
};

// ============================================================
// Aliquotas padrao do sistema legado (IBPT 2024/2025)
// ============================================================
export const DEFAULT_TAX_RATES: Record<"atual", Record<ProductCategory, TaxRate[]>> = {
  atual: {
    geral: [
      { code: "ICMS", rate: 0.18, basis: "por_dentro" },
      { code: "PIS", rate: 0.0165, basis: "por_dentro" },
      { code: "COFINS", rate: 0.076, basis: "por_dentro" },
      { code: "IPI", rate: 0.05, basis: "por_dentro" },
    ],
    alimentacao: [
      { code: "ICMS", rate: 0.12, basis: "por_dentro" },
      { code: "PIS", rate: 0.0065, basis: "por_dentro" },
      { code: "COFINS", rate: 0.03, basis: "por_dentro" },
      { code: "IPI", rate: 0.0, basis: "por_dentro" },
    ],
    eletronicos: [
      { code: "ICMS", rate: 0.18, basis: "por_dentro" },
      { code: "PIS", rate: 0.0165, basis: "por_dentro" },
      { code: "COFINS", rate: 0.076, basis: "por_dentro" },
      { code: "IPI", rate: 0.15, basis: "por_dentro" },
    ],
    combustivel: [
      { code: "ICMS", rate: 0.28, basis: "por_dentro" },
      { code: "PIS", rate: 0.05, basis: "por_dentro" },
      { code: "COFINS", rate: 0.23, basis: "por_dentro" },
      { code: "IPI", rate: 0.0, basis: "por_dentro" },
    ],
    vestuario: [
      { code: "ICMS", rate: 0.12, basis: "por_dentro" },
      { code: "PIS", rate: 0.0165, basis: "por_dentro" },
      { code: "COFINS", rate: 0.076, basis: "por_dentro" },
      { code: "IPI", rate: 0.05, basis: "por_dentro" },
    ],
    servicos: [
      { code: "PIS", rate: 0.0165, basis: "por_dentro" },
      { code: "COFINS", rate: 0.076, basis: "por_dentro" },
    ],
  },
};

// Aliquotas de teste do IVA Dual — Art. 124 EC 132/2023 (fixas, nao sobrescreviveis)
const IVA_TEST_RATES: TaxRate[] = [
  { code: "CBS", rate: 0.009, basis: "por_dentro" }, // 0.9% — federal
  { code: "IBS", rate: 0.001, basis: "por_dentro" }, // 0.1% — subnacional
];

// ============================================================
// Utilitarios
// ============================================================
function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

function buildRelatedGlossary(taxCodes: TaxCode[]): GlossaryEntry[] {
  const seen = new Set(taxCodes);
  const entries = Array.from(seen).map((code) => CITIZEN_GLOSSARY[code]);
  entries.push(CITIZEN_GLOSSARY["IBPT"]);
  entries.push(CITIZEN_GLOSSARY["ALIQUOTA"]);
  return entries;
}

function buildBreakdown(
  rates: TaxRate[],
  grossPrice: number,
  layer: TaxLayer
): TaxBreakdown[] {
  return rates
    .filter((r) => r.rate > 0)
    .map((r) => {
      const glossaryEntry = CITIZEN_GLOSSARY[r.code];
      return {
        code: r.code,
        rate: r.rate,
        amountPaid: round(grossPrice * r.rate),
        effectivePercentage: round(r.rate * 100, 4),
        governmentLevel: (glossaryEntry.governmentLevel ?? "federal") as GovernmentLevel,
        glossary: glossaryEntry,
        layer,
      };
    });
}

// ============================================================
// Calculo: Regime Atual
// ============================================================
function computeAtual(
  input: TaxCalculationInput,
  externalRates?: ExternalTaxRates
): TaxCalculationResult {
  const { grossPrice, productCategory } = input;
  const rates =
    externalRates?.["atual"]?.[productCategory] ??
    DEFAULT_TAX_RATES.atual[productCategory];

  const breakdown = buildBreakdown(rates, grossPrice, "legado");
  const totalRate = breakdown.reduce((s, b) => s + b.rate, 0);
  const netPrice = round(grossPrice * (1 - totalRate));

  return {
    grossPrice,
    netPrice,
    totalTaxAmount: round(grossPrice - netPrice),
    effectiveTaxRate: round(totalRate, 4),
    regime: "atual",
    productCategory,
    breakdown,
    relatedGlossary: buildRelatedGlossary(breakdown.map((b) => b.code)),
    isHybrid: false,
  };
}

// ============================================================
// Calculo: Regime 2026 — Hibrido Obrigatorio (EC 132/2023)
//
// REGRA: sistema legado CONTINUA ATIVO + IVA de teste EMPILHADO.
// O imposto total em 2026 e MAIOR que no regime atual.
// A fatia IVA (1%) e apenas a "semente" do novo sistema.
// A simplificacao ocorre entre 2029 e 2033.
// ============================================================
function computeHybrid2026(
  input: TaxCalculationInput,
  externalRates?: ExternalTaxRates
): TaxCalculationResult {
  const { grossPrice, productCategory } = input;

  const legacyRates =
    externalRates?.["atual"]?.[productCategory] ??
    DEFAULT_TAX_RATES.atual[productCategory];

  const legacyBreakdown = buildBreakdown(legacyRates, grossPrice, "legado");
  const ivaBreakdown = buildBreakdown(IVA_TEST_RATES, grossPrice, "iva_teste");
  const allBreakdown = [...legacyBreakdown, ...ivaBreakdown];

  const legacyRate = legacyRates.reduce((s, r) => s + r.rate, 0);
  const ivaRate = IVA_TEST_RATES.reduce((s, r) => s + r.rate, 0); // 0.01
  const totalRate = legacyRate + ivaRate;
  const netPrice = round(grossPrice * (1 - totalRate));

  const hybridSummary: HybridSummary = {
    legacyTaxAmount: round(legacyBreakdown.reduce((s, b) => s + b.amountPaid, 0)),
    legacyRate: round(legacyRate, 4),
    ivaTaxAmount: round(ivaBreakdown.reduce((s, b) => s + b.amountPaid, 0)),
    ivaRate: round(ivaRate, 4),
  };

  return {
    grossPrice,
    netPrice,
    totalTaxAmount: round(grossPrice - netPrice),
    effectiveTaxRate: round(totalRate, 4),
    regime: "reforma_2026",
    productCategory,
    breakdown: allBreakdown,
    relatedGlossary: buildRelatedGlossary(allBreakdown.map((b) => b.code)),
    isHybrid: true,
    hybridSummary,
  };
}

// ============================================================
// API publica do motor
// ============================================================
export function calculateTaxBreakdown(
  input: TaxCalculationInput,
  externalRates?: ExternalTaxRates
): TaxCalculationResult {
  if (input.grossPrice <= 0) {
    throw new RangeError("grossPrice deve ser maior que zero.");
  }
  return input.regime === "reforma_2026"
    ? computeHybrid2026(input, externalRates)
    : computeAtual(input, externalRates);
}

export function getGlossaryEntry(code: GlossaryCode): GlossaryEntry {
  return CITIZEN_GLOSSARY[code];
}

export function getAllGlossaryEntries(): GlossaryEntry[] {
  return (Object.keys(CITIZEN_GLOSSARY) as GlossaryCode[])
    .sort()
    .map((code) => CITIZEN_GLOSSARY[code]);
}
