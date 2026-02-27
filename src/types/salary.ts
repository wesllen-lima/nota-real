// ============================================================
// Motor de Renda — Tipos de contrato
// ============================================================

export interface InssBracket {
  upTo: number | null;
  rate: number;
}

export interface IrpfBracket {
  upTo: number | null;
  rate: number;
  /** Parcela a deduzir do calculo progressivo */
  parcela: number;
}

export type EmployerChargeLevel = "federal" | "social" | "trabalhista";

export interface EmployerCharge {
  code: string;
  label: string;
  description: string;
  rate: number;
  amount: number;
  isProvision: boolean;
  governmentLevel: EmployerChargeLevel;
}

export interface SalaryBreakdown {
  grossSalary: number;

  // Retencoes do empregado (visiveis no holerite)
  inssEmployee: number;
  irpfBase: number;
  irpfAmount: number;
  totalEmployeeDeductions: number;
  netSalary: number;
  effectiveEmployeeRate: number;
  marginalIrpfRate: number;

  // Custo patronal (invisivel para o empregado — "socio oculto")
  employerCharges: EmployerCharge[];
  totalEmployerCost: number;

  // Perspectiva consolidada (custo real do trabalho)
  realLaborCost: number;
  totalTaxBurden: number;
  effectiveTotalRate: number;
}

export interface TaxTrailShare {
  label: string;
  description: string;
  color: string;
  percentage: number;
  amount: number;
}
