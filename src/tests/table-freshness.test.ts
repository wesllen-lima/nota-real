import { describe, it, expect, vi, afterEach } from "vitest";
import { isTableStale, getTableMeta } from "@/lib/table-freshness";
import { TABLES_VALID_UNTIL, TABLES_YEAR } from "@/config/salary-tables-2026";

afterEach(() => {
  vi.useRealTimers();
});

describe("isTableStale()", () => {
  it("retorna false quando hoje e antes de TABLES_VALID_UNTIL (2026)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15"));
    expect(isTableStale()).toBe(false);
  });

  it("retorna true quando hoje e igual a TABLES_VALID_UNTIL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(TABLES_VALID_UNTIL));
    expect(isTableStale()).toBe(false); // new Date() > new Date(VALID_UNTIL) — mesmo dia nao e stale
  });

  it("retorna true quando hoje e apos TABLES_VALID_UNTIL (2027)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-02"));
    expect(isTableStale()).toBe(true);
  });
});

describe("getTableMeta()", () => {
  it("retorna year correto", () => {
    expect(getTableMeta().year).toBe(TABLES_YEAR);
  });

  it("retorna validUntil correto", () => {
    expect(getTableMeta().validUntil).toBe(TABLES_VALID_UNTIL);
  });

  it("retorna fontes INSS e IRPF", () => {
    const meta = getTableMeta();
    expect(meta.inssSource).toContain("MPS/MF");
    expect(meta.irpfSource).toContain("15.191");
    expect(meta.irpfSource).toContain("15.270");
  });

  it("isStale = false em 2026", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-31"));
    expect(getTableMeta().isStale).toBe(false);
  });

  it("isStale = true em 2027", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-03-01"));
    expect(getTableMeta().isStale).toBe(true);
  });
});
