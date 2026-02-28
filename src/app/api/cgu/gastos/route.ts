import { NextResponse } from "next/server";
import { CguResponseSchema } from "@/types/utility";
import { LOA_2026, LOA_PER_CAPITA_MENSAL } from "@/services/transparencia";

// Proxy para API Portal da Transparencia (CGU)
// Documentacao: https://api.portaldatransparencia.gov.br/swagger-ui/index.html
// Requer: chave-api header (cadastro em portaldatransparencia.gov.br/api)

const CGU_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";
const API_KEY = process.env.CGU_API_KEY ?? "";

async function fetchFuncao(codigoFuncao: string): Promise<number> {
  const params = new URLSearchParams({
    codigoFuncao,
    ano: "2026",
    pagina: "1",
  });

  const res = await fetch(
    `${CGU_BASE}/despesas/recursos-por-funcao?${params.toString()}`,
    {
      headers: {
        "chave-api": API_KEY,
        "Accept": "application/json",
      },
      next: { revalidate: 3600 * 6 },
    }
  );

  if (!res.ok) throw new Error(`CGU ${codigoFuncao}: HTTP ${res.status}`);

  const data: unknown = await res.json();
  const parsed = CguResponseSchema.parse(data);

  const totalPago = parsed.reduce((sum, item) => {
    const v = typeof item.valorPago === "string"
      ? parseFloat(item.valorPago.replace(",", "."))
      : item.valorPago;
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  return totalPago / LOA_2026.populacaoBrasil / 12;
}

export async function GET() {
  // Sem chave — retorna fallback LOA 2026 imediatamente
  if (!API_KEY) {
    return NextResponse.json({
      saude: LOA_PER_CAPITA_MENSAL.saude,
      educacao: LOA_PER_CAPITA_MENSAL.educacao,
      seguranca: LOA_PER_CAPITA_MENSAL.seguranca,
      previdencia: LOA_PER_CAPITA_MENSAL.previdencia,
      assistencia: LOA_PER_CAPITA_MENSAL.assistencia,
      source: "loa_2026_fallback",
    });
  }

  try {
    const [saude, educacao, seguranca, previdencia, assistencia] = await Promise.all([
      fetchFuncao("10"),
      fetchFuncao("12"),
      fetchFuncao("06"),
      fetchFuncao("09"),
      fetchFuncao("08"),
    ]);

    return NextResponse.json({
      saude,
      educacao,
      seguranca,
      previdencia,
      assistencia,
      source: "cgu_live",
    });
  } catch {
    return NextResponse.json({
      saude: LOA_PER_CAPITA_MENSAL.saude,
      educacao: LOA_PER_CAPITA_MENSAL.educacao,
      seguranca: LOA_PER_CAPITA_MENSAL.seguranca,
      previdencia: LOA_PER_CAPITA_MENSAL.previdencia,
      assistencia: LOA_PER_CAPITA_MENSAL.assistencia,
      source: "loa_2026_fallback",
    });
  }
}
