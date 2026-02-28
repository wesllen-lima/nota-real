import type { InssBracket, IrpfBracket, IrpfReduction } from "@/types/salary";

// ============================================================
// Tabela INSS Empregado — Progressiva por faixas 2026
// Portaria Interministerial MPS/MF n.13, 09/01/2026 — reajuste IPCA 3,9%
// Teto: R$ 8.475,55 | Desconto maximo: R$ 988,09
// Vigencia: 01/01/2026
// ============================================================
export const INSS_BRACKETS_2026: InssBracket[] = [
  { upTo: 1621.00, rate: 0.075 },
  { upTo: 2902.84, rate: 0.09  },
  { upTo: 4354.27, rate: 0.12  },
  { upTo: 8475.55, rate: 0.14  },
  { upTo: null,    rate: 0.14  }, // acima do teto: sem incremento
];

export const INSS_TETO_2026 = 8475.55;

// ============================================================
// Tabela IRPF — Tabela progressiva mensal
// Lei 15.191/2025 — vigente desde mai/2025, mantida em 2026
// Formula: imposto = (base × aliquota) - parcela_a_deduzir
// ============================================================
export const IRPF_BRACKETS_2026: IrpfBracket[] = [
  { upTo: 2428.80, rate: 0,     parcela: 0      },
  { upTo: 2826.65, rate: 0.075, parcela: 182.16 },
  { upTo: 3751.05, rate: 0.15,  parcela: 394.16 },
  { upTo: 4664.68, rate: 0.225, parcela: 675.49 },
  { upTo: null,    rate: 0.275, parcela: 908.73 },
];

// ============================================================
// Redutor linear do IRPF — Lei 15.270/2025
// Aplicado sobre rendimentos tributaveis BRUTOS (antes da deducao INSS)
// Zera integralmente o IRPF para rendas brutas ate R$ 5.000
// ============================================================
export const IRPF_REDUCTION_2026: IrpfReduction = {
  zeroThreshold: 5000.00,   // abaixo ou igual: zera o IRPF
  maxIncome:     7350.00,   // acima: sem reducao
  constant:       978.62,
  factor:           0.133145,
};

export const TABLES_YEAR = 2026;
export const TABLES_VALID_UNTIL = "2027-01-01"; // proxima Portaria esperada jan/2027
export const TABLE_EFFECTIVE_DATE = "2026-01-01";
