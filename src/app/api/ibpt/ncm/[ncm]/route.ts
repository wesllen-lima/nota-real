import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_TAX_RATES } from "@/lib/tax-engine";

export const revalidate = 86400; // 24h — tabela IBPT atualiza mensalmente

const IBPT_TOKEN = process.env.IBPT_TOKEN ?? "";
const IBPT_BASE = "https://api.ibpt.org.br/api/1";

// Contrato da resposta oficial api.ibpt.org.br (array)
const IbptItemSchema = z.object({
  codigo:    z.string(),
  descricao: z.string().optional(),
  nacional:  z.number(), // percentual inteiro ex: 14.68
  importado: z.number(),
  estadual:  z.number(), // % ICMS por UF
  municipal: z.number(), // % ISS
});

const IbptResponseSchema = z.array(IbptItemSchema).min(1);

function toDecimal(pct: number): number {
  // IBPT retorna percentuais inteiros (18.00 = 18%) — converte para 0..1
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
  req: Request,
  { params }: { params: Promise<{ ncm: string }> }
) {
  const { ncm } = await params;
  const { searchParams } = new URL(req.url);
  const uf = searchParams.get("uf") ?? "";

  if (!/^\d{8}$/.test(ncm)) {
    return NextResponse.json({ error: "NCM invalido — deve ter 8 digitos" }, { status: 400 });
  }

  if (!IBPT_TOKEN) {
    return buildFallback();
  }

  try {
    const query = new URLSearchParams({
      token: IBPT_TOKEN,
      codigo: ncm,
      ex: "0",
      descricao: "",
      ...(uf ? { uf } : {}),
    });

    const res = await fetch(`${IBPT_BASE}/NCMItens/GetByNcm?${query.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });

    if (!res.ok) throw new Error(`IBPT HTTP ${res.status}`);

    const raw: unknown = await res.json();
    const items = IbptResponseSchema.parse(raw);
    const data = items[0];

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
