import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_TAX_RATES } from "@/lib/tax-engine";

export const revalidate = 86400; // 24h — tabela IBPT atualiza mensalmente

const IBPT_TOKEN = process.env.IBPT_TOKEN ?? "";
const IBPT_BASE = "https://deolane.com.br/api/v1/ncm";

// Contrato da resposta da API IBPT (deolane proxy)
const IbptNcmSchema = z.object({
  codigo: z.string(),
  descricao: z.string().optional(),
  nacional:   z.number(), // % federal (IPI + PIS + COFINS) — valor inteiro ex: 12.45
  importado:  z.number(),
  estadual:   z.number(), // % ICMS
  municipal:  z.number(), // % ISS
});

type IbptNcmResponse = z.infer<typeof IbptNcmSchema>;

function toDecimal(pct: number): number {
  // IBPT retorna percentuais inteiros (ex: 18.00 = 18%) — converte para 0..1
  return pct / 100;
}

function buildFallback() {
  return NextResponse.json({
    nacional:  DEFAULT_TAX_RATES.atual.geral.reduce((s, r) =>
      ["PIS", "COFINS", "IPI"].includes(r.code) ? s + r.rate : s, 0),
    estadual:  DEFAULT_TAX_RATES.atual.geral.find((r) => r.code === "ICMS")?.rate ?? 0.18,
    municipal: 0,
    importado: 0,
    source: "default_rates",
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ncm: string }> }
) {
  const { ncm } = await params;

  if (!/^\d{8}$/.test(ncm)) {
    return NextResponse.json({ error: "NCM invalido — deve ter 8 digitos" }, { status: 400 });
  }

  if (!IBPT_TOKEN) {
    return buildFallback();
  }

  try {
    const res = await fetch(`${IBPT_BASE}/${ncm}?token=${IBPT_TOKEN}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });

    if (!res.ok) throw new Error(`IBPT HTTP ${res.status}`);

    const raw: unknown = await res.json();
    const data: IbptNcmResponse = IbptNcmSchema.parse(raw);

    return NextResponse.json({
      nacional:  toDecimal(data.nacional),
      estadual:  toDecimal(data.estadual),
      municipal: toDecimal(data.municipal),
      importado: toDecimal(data.importado),
      descricao: data.descricao,
      source: "ibpt_live",
    });
  } catch {
    return buildFallback();
  }
}
