import { TABLES_YEAR, TABLES_VALID_UNTIL } from "@/config/salary-tables-2026";

export function isTableStale(): boolean {
  return new Date() > new Date(TABLES_VALID_UNTIL);
}

export function getTableMeta() {
  return {
    year: TABLES_YEAR,
    validUntil: TABLES_VALID_UNTIL,
    inssSource: "Portaria MPS/MF n.13/2026",
    irpfSource: "Lei 15.191/2025 + Lei 15.270/2025",
    isStale: isTableStale(),
  };
}
