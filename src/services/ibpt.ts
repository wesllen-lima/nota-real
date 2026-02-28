import { z } from "zod";
import type { ExternalTaxRates, TaxRate } from "@/types/tax";
import { DEFAULT_TAX_RATES } from "@/lib/tax-engine";

const IbptRouteResponseSchema = z.object({
  nacional:  z.number(),
  estadual:  z.number(),
  municipal: z.number(),
  importado: z.number(),
  source: z.enum(["ibpt_live", "default_rates"]),
  descricao: z.string().optional(),
});

type IbptRouteResponse = z.infer<typeof IbptRouteResponseSchema>;

// Distribui a aliquota federal (nacional) proporcionalmente entre PIS, COFINS e IPI
// mantendo os pesos relativos do regime padrao para a categoria "geral".
function splitNacional(nacional: number): Pick<TaxRate, "code" | "rate" | "basis">[] {
  const defaults = DEFAULT_TAX_RATES.atual.geral.filter((r) =>
    ["PIS", "COFINS", "IPI"].includes(r.code)
  );
  const defaultTotal = defaults.reduce((s, r) => s + r.rate, 0);

  if (defaultTotal === 0 || nacional === 0) {
    return defaults.map((r) => ({ ...r }));
  }

  const scale = nacional / defaultTotal;
  return defaults.map((r) => ({
    code: r.code,
    rate: Math.round(r.rate * scale * 10000) / 10000,
    basis: r.basis,
  }));
}

function toExternalRates(data: IbptRouteResponse): ExternalTaxRates {
  const federalRates = splitNacional(data.nacional);
  const rates: TaxRate[] = [
    { code: "ICMS", rate: data.estadual, basis: "por_dentro" },
    ...federalRates,
  ];

  return {
    atual: {
      geral: rates,
    },
  };
}

export type IbptSource = "ibpt_live" | "default_rates";

export interface IbptResult {
  rates: ExternalTaxRates | null;
  source: IbptSource;
}

export async function fetchIbptByNcm(ncm: string): Promise<IbptResult> {
  try {
    const res = await fetch(`/api/ibpt/ncm/${ncm}`, {
      next: { revalidate: 3600 * 24 },
    });

    if (!res.ok) throw new Error(`IBPT route HTTP ${res.status}`);

    const raw: unknown = await res.json();
    const data = IbptRouteResponseSchema.parse(raw);

    if (data.source === "default_rates") {
      return { rates: null, source: "default_rates" };
    }

    return { rates: toExternalRates(data), source: "ibpt_live" };
  } catch {
    return { rates: null, source: "default_rates" };
  }
}
