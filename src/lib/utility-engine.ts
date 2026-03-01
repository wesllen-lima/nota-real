import type {
  CascadeTax,
  CosipEntry,
  RegionalAverage,
  UtilityInput,
  UtilityTaxRates,
  UtilityTaxResult,
} from "@/types/utility";

/**
 * Media nacional ponderada do ICMS sobre energia eletrica — fallback de seguranca.
 *
 * Fonte: CONFAZ — Convenio ICMS 110/2021 e Notas Tecnicas ANEEL 2025.
 * Usado SOMENTE quando a API IBPT (api.ibpt.org.br) estiver indisponivel.
 * Valor dinamico real e fornecido pelo caller via `input.icmsRate` (NCM 27160000 + UF).
 * Proibido hardcoding por UF — CLAUDE.md (Zero Hardcode Regional).
 */
const ICMS_ENERGIA_NACIONAL_MEDIA = 0.25;

/**
 * Media nacional do ICMS sobre agua/saneamento — fallback de seguranca.
 *
 * Fonte: CONFAZ — Convenio ICMS 97/2021; maioria dos estados aplica isencao ou reducao.
 * Valor dinamico real e fornecido pelo caller via `input.icmsRate` (NCM 22011000 + UF).
 */
const ICMS_AGUA_NACIONAL_MEDIA = 0.12;

/**
 * Aliquotas PIS/COFINS para distribuidoras de energia eletrica.
 *
 * Fonte: Decreto 5.442/2005 (energia eletrica — regime nao-cumulativo).
 * PIS: 1,65% | COFINS: 7,6%.
 * O campo `icms` e placeholder — sempre sobrescrito pelo valor dinamico do IBPT.
 */
const PIS_COFINS_ENERGIA: UtilityTaxRates = {
  icms: ICMS_ENERGIA_NACIONAL_MEDIA,
  pis: 0.0165,
  cofins: 0.076,
};

/**
 * Aliquotas PIS/COFINS para empresas de saneamento (agua).
 *
 * Fonte: Instrucao Normativa RFB 2.121/2022 + ADI SRF 25/2003 (regime cumulativo).
 * PIS: 0,65% | COFINS: 3,0% (lucro presumido — saneamento basico).
 * O campo `icms` e placeholder — sempre sobrescrito pelo valor dinamico do IBPT.
 */
const PIS_COFINS_AGUA: UtilityTaxRates = {
  icms: ICMS_AGUA_NACIONAL_MEDIA,
  pis: 0.0065,
  cofins: 0.03,
};

/**
 * COSIP/CIP estimada para Porto Velho/RO — residencial padrao.
 *
 * Fonte: Lei Municipal Porto Velho n.2.414/2019 (atualizada 2025).
 * Valor medio para apartamento/casa padrao (consumo ~250 kWh/mes).
 * Fora de RO, a COSIP e estimada em 5% da conta (parametro conservador).
 */
const COSIP_PORTO_VELHO = 9.87;

/**
 * Aliquota CBS (Contribuicao sobre Bens e Servicos) — transicao 2026.
 * Fonte: EC 132/2023, Art. 124; LC 214/2024 (fase de teste — aliquota reduzida).
 */
const CBS_RATE = 0.009;

/**
 * Aliquota IBS (Imposto sobre Bens e Servicos) — transicao 2026.
 * Fonte: EC 132/2023, Art. 124; LC 214/2024 (fase de teste — aliquota reduzida).
 * CBS + IBS = 1% total no periodo de teste (nao substitui tributos legados — empilha).
 */
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

function round(v: number, d = 2): number {
  return Math.round(v * 10 ** d) / 10 ** d;
}

/**
 * Resolve as aliquotas efetivas para o tipo de utilidade.
 * O ICMS e sempre proveniente do caller (IBPT em tempo real) — nunca hardcoded por UF.
 * PIS/COFINS sao constantes nacionais fixadas em lei federal.
 *
 * @param input - Dados da fatura com tipo (energia|agua) e icmsRate opcional.
 * @returns Aliquotas efetivas { icms, pis, cofins }.
 */
function getRates(input: UtilityInput): UtilityTaxRates {
  if (input.type === "energia") {
    return {
      icms: input.icmsRate ?? ICMS_ENERGIA_NACIONAL_MEDIA,
      pis: PIS_COFINS_ENERGIA.pis,
      cofins: PIS_COFINS_ENERGIA.cofins,
    };
  }

  return {
    icms: input.icmsRate ?? ICMS_AGUA_NACIONAL_MEDIA,
    pis: PIS_COFINS_AGUA.pis,
    cofins: PIS_COFINS_AGUA.cofins,
  };
}

/**
 * Calcula o imposto em cascata do ICMS sobre PIS/COFINS.
 *
 * Nas contas de energia e agua, o ICMS e calculado sobre a base que JA INCLUI
 * os valores de PIS e COFINS ("ICMS por dentro"), criando o efeito de cascata.
 * Fonte: Clausula 1a, Convenio ICMS 110/2021 + STJ RE 949.297/SP (repetitivo 2023).
 *
 * Formula: cascadeAmount = icmsRate × (pisAmount + cofinsAmount).
 *
 * @param totalValue - Valor total da fatura em R$.
 * @param rates - Aliquotas efetivas { icms, pis, cofins }.
 * @returns CascadeTax com valor absoluto e percentual sobre a fatura.
 */
function buildCascade(
  totalValue: number,
  rates: UtilityTaxRates
): CascadeTax {
  // Imposto em cascata: ICMS incide sobre a base que ja contem PIS e COFINS.
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

/**
 * Calcula a carga tributaria real de uma fatura de energia ou agua.
 *
 * Tributos calculados:
 *   - ICMS: aliquota estadual via IBPT (dinamico) ou fallback nacional.
 *     Fonte: CONFAZ — aliquotas variam de 0% (isencao) a ~35% por UF.
 *   - PIS: Decreto 5.442/2005 (energia 1,65%) ou IN RFB 2.121/2022 (agua 0,65%).
 *   - COFINS: Decreto 5.442/2005 (energia 7,6%) ou IN RFB 2.121/2022 (agua 3,0%).
 *   - COSIP/CIP: taxa municipal para custeio de iluminacao publica (Art. 149-A, CF/1988).
 *   - CBS + IBS (regime 2026): EC 132/2023, Art. 124 — empilhados sobre os legados.
 *
 * Importante: ICMS incide sobre base que JA INCLUI PIS/COFINS (efeito cascata).
 * O campo `cascade` expoe explicitamente este custo extra ao utilizador.
 *
 * @param input - UtilityInput com tipo, valor, regime e icmsRate (UF-especifico).
 * @returns UtilityTaxResult com decomposicao completa de todos os tributos.
 */
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
