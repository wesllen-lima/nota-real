import type {
  CascadeTax,
  CosipEntry,
  RegionalAverage,
  UtilityInput,
  UtilityTaxRates,
  UtilityTaxResult,
} from "@/types/utility";
import { ICMS_ENERGIA_BY_UF, ICMS_AGUA_BY_UF } from "@/config/icms-by-uf";

// PIS/COFINS energia — distribuidoras (regime nao-cumulativo, ANEEL 2025)
const PIS_COFINS_ENERGIA: UtilityTaxRates = {
  icms: 0.25,     // fallback (sobrescrito por UF)
  pis: 0.0165,    // 1,65% — Decreto 5.442/2005 (nao-cumulativo)
  cofins: 0.076,  // 7,6% — Decreto 5.442/2005
};

// PIS/COFINS agua — saneamento (lucro presumido, RFB)
const PIS_COFINS_AGUA: UtilityTaxRates = {
  icms: 0.0,      // fallback (sobrescrito por UF)
  pis: 0.0065,    // 0,65% — regime cumulativo saneamento
  cofins: 0.03,   // 3,0%
};

// COSIP/CIP estimada — Porto Velho (media residencial 2025)
const COSIP_PORTO_VELHO = 9.87;   // R$ — media apartamento/casa padrao

// IVA Dual teste 2026 — Art. 124 EC 132/2023 (fixo)
const CBS_RATE = 0.009;
const IBS_RATE = 0.001;

// ============================================================
// Medias regionais Rondonia — simulacao sem fatura
// ============================================================
export const REGIONAL_AVERAGES: RegionalAverage[] = [
  {
    uf: "RO",
    municipio: "Porto Velho",
    // 250 kWh × R$0,72/kWh (Bandeira Verde, tarifa ENERGISA RO 2025)
    avgEnergia: 180.0,
    // 15 m³ × R$4,80/m³ (CAERD tarifa residencial 2025)
    avgAgua: 72.0,
    cosipEstimated: COSIP_PORTO_VELHO,
  },
];

// ============================================================
// Utilitarios internos
// ============================================================
function round(v: number, d = 2): number {
  return Math.round(v * 10 ** d) / 10 ** d;
}

function getRates(input: UtilityInput): UtilityTaxRates {
  const uf = input.uf?.toUpperCase() ?? "RO";

  if (input.type === "energia") {
    return {
      icms: ICMS_ENERGIA_BY_UF[uf] ?? 0.25,
      pis: PIS_COFINS_ENERGIA.pis,
      cofins: PIS_COFINS_ENERGIA.cofins,
    };
  }

  // agua
  const icmsAgua =
    ICMS_AGUA_BY_UF[uf] !== undefined
      ? ICMS_AGUA_BY_UF[uf]
      : ICMS_AGUA_BY_UF["_default"] ?? 0.12;

  return {
    icms: icmsAgua,
    pis: PIS_COFINS_AGUA.pis,
    cofins: PIS_COFINS_AGUA.cofins,
  };
}

function buildCascade(
  totalValue: number,
  rates: UtilityTaxRates
): CascadeTax {
  // Imposto em cascata: ICMS incide sobre a base que ja contem PIS e COFINS.
  // Cascata = icmsRate * (pisAmount + cofinsAmount)
  const pisAmount = totalValue * rates.pis;
  const cofinsAmount = totalValue * rates.cofins;
  const cascadeAmount = round(rates.icms * (pisAmount + cofinsAmount));
  return {
    amount: cascadeAmount,
    percentageOfBill: round((cascadeAmount / totalValue) * 100, 2),
    icmsRate: rates.icms,
    pisCofinsRate: rates.pis + rates.cofins,
  };
}

function buildCosip(input: UtilityInput): CosipEntry | null {
  if (input.type !== "energia") return null;

  const uf = input.uf?.toUpperCase() ?? "RO";
  // COSIP e taxa municipal — so usamos estimativa regional para RO
  const amount = uf === "RO" ? COSIP_PORTO_VELHO : round(input.totalValue * 0.05);

  return {
    amount: round(amount),
    label: "COSIP/CIP — Contrib. de Iluminacao Publica",
    isEstimated: input.inputMode === "simulado" || uf !== "RO",
  };
}

// ============================================================
// Motor publico
// ============================================================
export function calculateUtilityTax(input: UtilityInput): UtilityTaxResult {
  const rates = getRates(input);
  const { totalValue, regime } = input;

  const icmsAmount = round(totalValue * rates.icms);
  const pisAmount  = round(totalValue * rates.pis);
  const cofinsAmount = round(totalValue * rates.cofins);
  const cosip = buildCosip(input);
  const cascade = buildCascade(totalValue, rates);

  const cosipAmount = cosip?.amount ?? 0;
  let totalTaxAmount = icmsAmount + pisAmount + cofinsAmount + cosipAmount;

  // Regime 2026 — empilha CBS + IBS (nao substitui)
  const isHybrid = regime === "reforma_2026";
  const cbsAmount = isHybrid ? round(totalValue * CBS_RATE) : 0;
  const ibsAmount = isHybrid ? round(totalValue * IBS_RATE) : 0;
  const hybridExtraTax = cbsAmount + ibsAmount;
  if (isHybrid) totalTaxAmount = round(totalTaxAmount + hybridExtraTax);

  const netValue = round(totalValue - totalTaxAmount);
  const totalTaxRate = round(totalTaxAmount / totalValue, 4);

  return {
    type: input.type,
    totalValue,
    inputMode: input.inputMode,
    regime: regime ?? "atual",
    icmsAmount,
    icmsRate: rates.icms,
    pisAmount,
    pisRate: rates.pis,
    cofinsAmount,
    cofinsRate: rates.cofins,
    cosip,
    cascade,
    totalTaxAmount: round(totalTaxAmount),
    totalTaxRate,
    netValue: Math.max(0, netValue),
    isHybrid,
    cbsAmount,
    ibsAmount,
    hybridExtraTax,
  };
}

export function getRegionalAverage(uf: string): RegionalAverage | undefined {
  return REGIONAL_AVERAGES.find((r) => r.uf === uf.toUpperCase());
}

export function getDefaultRegionalAverage(): RegionalAverage {
  return REGIONAL_AVERAGES[0];
}
