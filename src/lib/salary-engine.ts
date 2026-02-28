import type {
  EmployerCharge,
  IrpfBracket,
  InssBracket,
  SalaryBreakdown,
  TaxTrailShare,
} from "@/types/salary";

// ============================================================
// Tabela INSS Empregado — Progressiva por faixas 2026
// Fonte: Portaria MPS prevista — Salario Minimo R$ 1.621 (scaling x1.148 vs 2025)
// Teto de contribuicao: R$ 8.940,00
// ============================================================
const INSS_BRACKETS: InssBracket[] = [
  { upTo: 1621.0, rate: 0.075 },
  { upTo: 3063.0, rate: 0.09 },
  { upTo: 4592.0, rate: 0.12 },
  { upTo: 8940.0, rate: 0.14 },
  { upTo: null, rate: 0.14 }, // acima do teto: sem incremento
];
const INSS_TETO = 8940.0;

// ============================================================
// Tabela IRPF — 2026 (isencao ampliada para R$ 5.000)
// Formula: imposto = (base × aliquota) - parcela_a_deduzir
// Faixas reescalonadas ~2.21x em relacao a tabela 2025
// ============================================================
const IRPF_BRACKETS: IrpfBracket[] = [
  { upTo: 5000.0,  rate: 0,     parcela: 0      }, // isento — novo 2026
  { upTo: 6250.0,  rate: 0.075, parcela: 375.0  },
  { upTo: 8295.0,  rate: 0.15,  parcela: 843.9  },
  { upTo: 10300.0, rate: 0.225, parcela: 1462.5 },
  { upTo: null,    rate: 0.275, parcela: 1977.5 },
];

// ============================================================
// Glossario dos encargos patronais para Tooltip didatico
// ============================================================
export const EMPLOYER_GLOSSARY: Record<string, string> = {
  INSS_PATRONAL:
    "Contribuicao previdenciaria paga pela empresa ao INSS sobre cada salario, " +
    "adicional e independente da contribuicao do empregado. " +
    "Financia aposentadorias e beneficios do RGPS. Aliquota basica: 20% sobre a folha.",
  RAT:
    "Risco Acidente de Trabalho — seguro obrigatorio pago pela empresa para cobrir " +
    "acidentes ocupacionais e doencas do trabalho. Aliquota de 1% (risco leve), " +
    "2% (risco medio) ou 3% (risco grave) conforme a atividade economica.",
  SISTEMA_S:
    "Conjunto de contribuicoes compulsorias para entidades paraestatais: " +
    "SESC, SENAC (comercio), SENAI, SESI (industria), SEBRAE, SENAT e SESCOOP. " +
    "Financia cursos profissionais, clubes e programas sociais. Total aproximado: 5,8%.",
  FGTS:
    "Fundo de Garantia por Tempo de Servico — a empresa deposita 8% mensalmente " +
    "em conta vinculada. O trabalhador so saca em situacoes especificas (demissao sem justa causa, " +
    "compra de imovel, doenca grave). Na pratica, e um custo real do empregador " +
    "que o trabalhador dificilmente acessa como renda corrente.",
  FERIAS:
    "Provisao mensal equivalente a 1/12 do salario (8,33%) + 1/3 constitucional (2,78%). " +
    "A empresa acumula esse valor todo mes para pagar as ferias anuais. " +
    "Total: ~11,11% do salario mensal como custo real adicional.",
  DECIMO_TERCEIRO:
    "Provisao mensal de 1/12 do salario bruto para o pagamento do 13o salario " +
    "em novembro e dezembro. Obrigacao constitucional desde 1962 (Art. 7o CF). " +
    "Representa 8,33% de custo adicional mensal sobre a folha.",
};

// ============================================================
// Glossario das retencoes do empregado
// ============================================================
export const EMPLOYEE_GLOSSARY: Record<"INSS" | "IRPF", string> = {
  INSS:
    "Contribuicao previdenciaria retida diretamente do salario. Calculada progressivamente: " +
    "7,5% (ate R$ 1.621 — salario minimo 2026) ate 14% (acima de R$ 4.592). O teto e R$ 8.940,00 — acima disso, " +
    "nao ha incremento. Garante direito a aposentadoria, auxilio-doenca e salario-maternidade.",
  IRPF:
    "Imposto de Renda retido na fonte mensalmente (IRRF). " +
    "Calculado sobre o salario bruto menos o INSS. Isento ate R$ 5.000,00 (nova regra 2026); " +
    "aliquota marginal maxima de 27,5% acima de R$ 10.300,00. " +
    "A aliquota efetiva e sempre inferior a marginal pois as faixas inferiores pagam menos.",
};

// ============================================================
// Utilitario de arredondamento
// ============================================================
function round(v: number, d = 2): number {
  return Math.round(v * 10 ** d) / 10 ** d;
}

// ============================================================
// Calculo INSS — soma progressiva por faixas
// ============================================================
function calcInss(grossSalary: number): number {
  const base = Math.min(grossSalary, INSS_TETO);
  let total = 0;
  let prev = 0;
  for (const bracket of INSS_BRACKETS) {
    const ceiling = bracket.upTo ?? INSS_TETO;
    if (base <= prev) break;
    total += (Math.min(base, ceiling) - prev) * bracket.rate;
    prev = ceiling;
    if (bracket.upTo === null) break;
  }
  return round(total);
}

// ============================================================
// Calculo IRPF — tabela progressiva com parcela a deduzir
// ============================================================
function calcIrpf(base: number): { amount: number; marginalRate: number } {
  for (const b of IRPF_BRACKETS) {
    if (b.upTo === null || base <= b.upTo) {
      return {
        amount: round(Math.max(0, base * b.rate - b.parcela)),
        marginalRate: b.rate,
      };
    }
  }
  const last = IRPF_BRACKETS[IRPF_BRACKETS.length - 1];
  return {
    amount: round(base * last.rate - last.parcela),
    marginalRate: last.rate,
  };
}

// ============================================================
// API publica: motor de calculo salarial
// ============================================================
export function calculateSalaryBreakdown(grossSalary: number): SalaryBreakdown {
  if (grossSalary <= 0) throw new RangeError("grossSalary deve ser maior que zero.");

  // --- Empregado ---
  const inssEmployee = calcInss(grossSalary);
  const irpfBase = Math.max(0, grossSalary - inssEmployee);
  const { amount: irpfAmount, marginalRate: marginalIrpfRate } = calcIrpf(irpfBase);
  const totalEmployeeDeductions = round(inssEmployee + irpfAmount);
  const netSalary = round(grossSalary - totalEmployeeDeductions);
  const effectiveEmployeeRate = round(totalEmployeeDeductions / grossSalary, 4);

  // --- Empregador ---
  const chargesConfig: Array<{
    code: string;
    label: string;
    rate: number;
    isProvision: boolean;
    governmentLevel: EmployerCharge["governmentLevel"];
  }> = [
    {
      code: "INSS_PATRONAL",
      label: "INSS Patronal",
      rate: 0.2,
      isProvision: false,
      governmentLevel: "federal",
    },
    {
      code: "RAT",
      label: "RAT — Acid. Trabalho",
      rate: 0.02,
      isProvision: false,
      governmentLevel: "federal",
    },
    {
      code: "SISTEMA_S",
      label: "Sistema S",
      rate: 0.058,
      isProvision: false,
      governmentLevel: "social",
    },
    {
      code: "FGTS",
      label: "FGTS",
      rate: 0.08,
      isProvision: false,
      governmentLevel: "trabalhista",
    },
    {
      code: "FERIAS",
      label: "Provisao Ferias",
      rate: 0.1111,
      isProvision: true,
      governmentLevel: "trabalhista",
    },
    {
      code: "DECIMO_TERCEIRO",
      label: "Provisao 13o Salario",
      rate: 0.0833,
      isProvision: true,
      governmentLevel: "trabalhista",
    },
  ];

  const employerCharges: EmployerCharge[] = chargesConfig.map(
    ({ code, label, rate, isProvision, governmentLevel }) => ({
      code,
      label,
      description: EMPLOYER_GLOSSARY[code],
      rate,
      amount: round(grossSalary * rate),
      isProvision,
      governmentLevel,
    })
  );

  const totalEmployerCost = round(
    employerCharges.reduce((s, c) => s + c.amount, 0)
  );
  const realLaborCost = round(grossSalary + totalEmployerCost);
  const totalTaxBurden = round(totalEmployeeDeductions + totalEmployerCost);
  const effectiveTotalRate = round(totalTaxBurden / realLaborCost, 4);

  return {
    grossSalary,
    inssEmployee,
    irpfBase,
    irpfAmount,
    totalEmployeeDeductions,
    netSalary,
    effectiveEmployeeRate,
    marginalIrpfRate,
    employerCharges,
    totalEmployerCost,
    realLaborCost,
    totalTaxBurden,
    effectiveTotalRate,
  };
}

// ============================================================
// Distribuicao estimada da arrecadacao — LOA 2024 (STN/SOF)
// Fonte: Relatorio de Acompanhamento Fiscal IPCA/STN 2024
// ============================================================
const TAX_TRAIL_DISTRIBUTION: Array<Omit<TaxTrailShare, "amount">> = [
  {
    label: "Previdencia e Pensoes",
    description:
      "A maior fatia da arrecadacao federal financia o RGPS (aposentadorias, pensoes por morte, " +
      "auxilio-doenca). O sistema e estruturalmente deficitario — o Tesouro cobre o rombo com tributos gerais. " +
      "Em 2024 o deficit previdenciario superou R$ 300 bilhoes.",
    color: "#EF4444",
    percentage: 0.38,
  },
  {
    label: "Juros da Divida Publica",
    description:
      "Parcela dos impostos destinada ao pagamento de juros da divida publica federal. " +
      "Com a Selic em 14,75% ao ano em 2026, este e o segundo maior destino da arrecadacao. " +
      "A cada R$ 100 arrecadados, cerca de R$ 24 vao para credores da divida.",
    color: "#F59E0B",
    percentage: 0.24,
  },
  {
    label: "Maquina Publica",
    description:
      "Custo do funcionalismo federal, custeio dos tres Poderes (Executivo, Legislativo, Judiciario), " +
      "orgaos de controle e TCU. Inclui salarios, pensoes de servidores, " +
      "beneficios corporativos e despesas correntes da administracao publica.",
    color: "#3B82F6",
    percentage: 0.23,
  },
  {
    label: "Beneficios Sociais",
    description:
      "Transferencias de renda como Bolsa Familia, BPC (Beneficio de Prestacao Continuada " +
      "para idosos e pessoas com deficiencia de baixa renda) e auxilio-gas. " +
      "E a menor fatia — mas a que chega diretamente a camada mais vulneravel da populacao.",
    color: "#10B981",
    percentage: 0.15,
  },
];

export function computeTaxTrail(totalTaxAmount: number): TaxTrailShare[] {
  return TAX_TRAIL_DISTRIBUTION.map((s) => ({
    ...s,
    amount: Math.round(totalTaxAmount * s.percentage * 100) / 100,
  }));
}

// Alias estatico exportado para o BudgetThermometer (sem depender de totalTaxImpact > 0)
export { TAX_TRAIL_DISTRIBUTION as BUDGET_DISTRIBUTION };
