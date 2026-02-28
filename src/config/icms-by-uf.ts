// ============================================================
// Aliquotas de ICMS por UF — Energia Eletrica (residencial 2025/2026)
// Fontes: CONFAZ, Decretos estaduais
// Ultima atualizacao: fev/2026
// ============================================================
// Destaques:
//   SP: Lei 17.787/2023 — reducao para 12% (residencial)
//   PR: Decreto s/n 2023 — 29% (residencial, acima da media)
//   RS: aliquota padrao CONFAZ — 30%
//   RO: Decreto 21.959/2017 — 25% (residencial padrao)
export const ICMS_ENERGIA_BY_UF: Record<string, number> = {
  AC: 0.17, AL: 0.25, AP: 0.18, AM: 0.25, BA: 0.25,
  CE: 0.22, DF: 0.25, ES: 0.25, GO: 0.25, MA: 0.22,
  MT: 0.25, MS: 0.17, MG: 0.25, PA: 0.25, PB: 0.25,
  PR: 0.29, PE: 0.25, PI: 0.25, RJ: 0.18, RN: 0.25,
  RS: 0.30, RO: 0.25, RR: 0.25, SC: 0.25, SP: 0.12,
  SE: 0.25, TO: 0.25,
};

// ============================================================
// Aliquotas de ICMS por UF — Agua/Saneamento (residencial 2025/2026)
// Fontes: Legislacoes estaduais
// Destaques:
//   RO: Decreto 12.051/2006 — isencao total para saneamento basico
//   MG: isencao estadual — Decreto 44.844/2008
//   _default: media nacional (maioria isenta ou aliquota reduzida)
// ============================================================
export const ICMS_AGUA_BY_UF: Record<string, number> = {
  RO: 0.0,  SP: 0.12, RJ: 0.12, MG: 0.0,  RS: 0.12,
  PR: 0.12, BA: 0.17, PE: 0.17, CE: 0.12, GO: 0.12,
  // Demais: media nacional
  _default: 0.12,
};
