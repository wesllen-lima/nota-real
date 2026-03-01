import type { InssBracket, IrpfBracket, IrpfReduction } from "@/types/salary";

/**
 * Tabela INSS Empregado — calculo progressivo por faixas de salario.
 *
 * Fonte: Portaria Interministerial MPS/MF n.13, DOU 09/01/2026.
 * Reajuste: IPCA acumulado 3,9% (jan/2025–dez/2025).
 * Vigencia: 01/01/2026 a 31/12/2026.
 * Teto de contribuicao: R$ 8.475,55.
 * Desconto maximo possivel: R$ 988,09.
 *
 * Regra matematica: cada aliquota incide APENAS sobre a parcela
 * do salario que cai dentro daquela faixa (calculo progressivo).
 * Nunca aplicar a aliquota marginal sobre o salario integral.
 */
export const INSS_BRACKETS_2026: InssBracket[] = [
  { upTo: 1621.00, rate: 0.075 },
  { upTo: 2902.84, rate: 0.09  },
  { upTo: 4354.27, rate: 0.12  },
  { upTo: 8475.55, rate: 0.14  },
  { upTo: null,    rate: 0.14  }, // acima do teto: sem incremento
];

/** Teto de contribuicao INSS 2026. Fonte: Portaria Interministerial MPS/MF n.13/2026. */
export const INSS_TETO_2026 = 8475.55;

/**
 * Tabela IRPF mensal — regime de tributacao progressiva com "parcela a deduzir".
 *
 * Fonte: Lei 15.191/2025, DOU 09/05/2025 (vigente desde mai/2025, mantida para 2026).
 * Base de calculo: rendimento tributavel = salario bruto − contribuicao INSS.
 *
 * Formula de aplicacao: imposto_bruto = max(0, base × aliquota − parcela_a_deduzir).
 * A "parcela a deduzir" e a equivalente matematica do calculo progressivo —
 * e publicada pela RFB para simplificar o calculo sem perder a progressividade.
 *
 * Verificacao das parcelas (cada parcela = parcela_anterior + limite_faixa_anterior × delta_aliquota):
 *   parcela_2 = 2428.80 × 0.075                           = 182.16
 *   parcela_3 = 182.16 + 2826.65 × 0.075                 = 394.16
 *   parcela_4 = 394.16 + 3751.05 × 0.075                 = 675.49
 *   parcela_5 = 675.49 + 4664.68 × 0.05                  = 908.73 (RFB arredonda para cima)
 */
export const IRPF_BRACKETS_2026: IrpfBracket[] = [
  { upTo: 2428.80, rate: 0,     parcela: 0      },
  { upTo: 2826.65, rate: 0.075, parcela: 182.16 },
  { upTo: 3751.05, rate: 0.15,  parcela: 394.16 },
  { upTo: 4664.68, rate: 0.225, parcela: 675.49 },
  { upTo: null,    rate: 0.275, parcela: 908.73 },
];

/**
 * Redutor linear do IRPF ("deducao complementar automatica").
 *
 * Fonte: Lei 15.270/2025, DOU 27/02/2025 (Art. 1o, §§ 1o e 2o).
 * Aplicado sobre rendimentos tributaveis BRUTOS (antes da deducao INSS).
 *
 * Tres faixas de comportamento:
 *   1. renda_bruta <= zeroThreshold (R$ 5.000): IRPF zerado integralmente.
 *   2. zeroThreshold < renda_bruta <= maxIncome: reducao = constant − factor × renda_bruta.
 *   3. renda_bruta > maxIncome (R$ 7.350): sem reducao (IRPF cheio da tabela progressiva).
 *
 * Verificacao de consistencia dos parametros:
 *   constant − factor × 7350 = 978.62 − 0.133145 × 7350 = 978.62 − 978.62 = 0 (correto).
 */
export const IRPF_REDUCTION_2026: IrpfReduction = {
  zeroThreshold: 5000.00,   // abaixo ou igual: zera o IRPF
  maxIncome:     7350.00,   // acima: sem reducao
  constant:       978.62,
  factor:           0.133145,
};

export const TABLES_YEAR = 2026;
export const TABLES_VALID_UNTIL = "2027-01-01"; // proxima Portaria esperada jan/2027
export const TABLE_EFFECTIVE_DATE = "2026-01-01";
