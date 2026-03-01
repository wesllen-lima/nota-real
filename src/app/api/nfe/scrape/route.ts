import { NextResponse } from "next/server";
import { z } from "zod";

// ============================================================
// Whitelist de domínios SEFAZ legítimos (NFC-e pública)
// NT 2016.002 — SEFAZ nacional + regionais
// ============================================================
const SEFAZ_ALLOWED_HOSTS = new Set([
  "www.nfce.fazenda.sp.gov.br",
  "nfce.fazenda.sp.gov.br",
  "www.sefaz.rs.gov.br",
  "dfe-portal.svrs.rs.gov.br",
  "www.sefaz.mt.gov.br",
  "www.sefaz.ba.gov.br",
  "www.sefazce.gov.br",
  "www.sefaz.pe.gov.br",
  "www.sefaz.rj.gov.br",
  "www.sefaz.pr.gov.br",
  "www.sefaz.pa.gov.br",
  "www.sefaz.am.gov.br",
  "www.sefaz.go.gov.br",
  "www.sefaz.ms.gov.br",
  "www.sefaz.ro.gov.br",
  "www.sefaz.rr.gov.br",
  "www.sefaz.ap.gov.br",
  "www.sefaz.to.gov.br",
  "www.sefaz.rn.gov.br",
  "www.sefaz.pb.gov.br",
  "www.sefaz.al.gov.br",
  "www.sefaz.se.gov.br",
  "www.sefaz.pi.gov.br",
  "www.sefaz.ma.gov.br",
  "www.sefaz.ac.gov.br",
  "www.sefaz.mg.gov.br",
  "www.sefaz.es.gov.br",
  "www.sefaz.df.gov.br",
  "www.sefaz.sc.gov.br",
  "nfce.sefaz.pe.gov.br",
  "nfce.sefaz.ma.gov.br",
  "nfce.sefaz.rj.gov.br",
  "nfce.sefaz.ro.gov.br",
]);

const RequestSchema = z.object({
  url: z.string().url("URL inválida"),
});

// ============================================================
// Parser do HTML público da NFC-e — multi-estado
// Extrai os valores reais sem inventar dados
// ============================================================
function extractNumber(html: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) {
      const raw = match[1].replace(/\./g, "").replace(",", ".");
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) return val;
    }
  }
  return null;
}

function extractText(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) return match[1].trim().replace(/\s+/g, " ");
  }
  return null;
}

function parseNfceHtml(html: string): {
  vNF: number | null;
  vTotTrib: number | null;
  vICMS: number | null;
  vPIS: number | null;
  vCOFINS: number | null;
  xNome: string | null;
  xMun: string | null;
  UF: string | null;
  cnpj: string | null;
} {
  // Padrões comuns entre portais SEFAZ estaduais
  const vNF = extractNumber(html, [
    /[Vv]alor\s+[Tt]otal\s+da\s+[Nn]ota[\s\S]{0,60}?R\$\s*([\d.,]+)/,
    /id="[^"]*totalNota[^"]*"[^>]*>[\s\S]{0,30}?R\$\s*([\d.,]+)/,
    /[Tt]otal\s+da\s+NF[^:]*:\s*R\$\s*([\d.,]+)/,
    /<span[^>]*class="[^"]*total[Nn]ota[^"]*"[^>]*>([\d.,]+)/,
  ]);

  const vTotTrib = extractNumber(html, [
    /[Vv]alor\s+[Aa]proximado\s+dos?\s+[Tt]ributos[\s\S]{0,80}?R\$\s*([\d.,]+)/,
    /[Tt]ributos\s+[Aa]proximados[\s\S]{0,80}?R\$\s*([\d.,]+)/,
    /[Ii]nformações?\s+dos?\s+[Tt]ributos[\s\S]{0,80}?R\$\s*([\d.,]+)/,
    /vTotTrib[^>]*>([\d.,]+)/,
    /id="[^"]*tributo[^"]*"[^>]*>([\d.,]+)/,
  ]);

  const vICMS = extractNumber(html, [
    /ICMS[\s\S]{0,60}?R\$\s*([\d.,]+)/,
    /id="[^"]*icms[^"]*"[^>]*>([\d.,]+)/,
  ]);

  const vPIS = extractNumber(html, [
    /PIS[\s\S]{0,60}?R\$\s*([\d.,]+)/,
    /id="[^"]*pis[^"]*"[^>]*>([\d.,]+)/,
  ]);

  const vCOFINS = extractNumber(html, [
    /COFINS[\s\S]{0,60}?R\$\s*([\d.,]+)/,
    /id="[^"]*cofins[^"]*"[^>]*>([\d.,]+)/,
  ]);

  const xNome = extractText(html, [
    /[Rr]azão?\s+[Ss]ocial[\s\S]{0,40}?<[^>]+>([\w\s.&\/,-]{4,80})</,
    /id="[^"]*nomeEmitente[^"]*"[^>]*>([\w\s.&\/,-]{4,80})</,
    /<h4[^>]*>([\w\s.&\/,-]{4,80})<\/h4>/,
  ]);

  const xMun = extractText(html, [
    /[Mm]unicípio[\s\S]{0,40}?<[^>]+>([A-ZÀ-Ú][a-zA-ZÀ-ú\s]{2,40})</,
  ]);

  const UF = extractText(html, [
    /\bUF\b[\s\S]{0,40}?<[^>]+>([A-Z]{2})</,
    />([A-Z]{2})\s*-\s*[A-ZÀ-Ú]/,
  ]);

  const cnpj = extractText(html, [
    /CNPJ[\s\S]{0,40}?(\d{2}[.\s]?\d{3}[.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2})/,
  ]);

  return { vNF, vTotTrib, vICMS, vPIS, vCOFINS, xNome, xMun, UF, cnpj };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { url } = parsed.data;

  // Validação de host — apenas domínios SEFAZ oficiais
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  // Primeira camada: sufixo obrigatório — qualquer host que não seja .gov.br é bloqueado imediatamente
  if (!parsedUrl.hostname.endsWith(".gov.br")) {
    return NextResponse.json(
      { error: `Domínio não autorizado: ${parsedUrl.hostname}. Apenas portais oficiais .gov.br são aceitos.` },
      { status: 403 }
    );
  }

  // Segunda camada: whitelist explícita de portais SEFAZ conhecidos
  if (!SEFAZ_ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: `Domínio não autorizado: ${parsedUrl.hostname}. Apenas portais SEFAZ oficiais são suportados.` },
      { status: 403 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NotaReal/2026; +https://nota-real.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `SEFAZ retornou HTTP ${res.status}. Tente novamente ou faça o upload do XML.` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const extracted = parseNfceHtml(html);

    if (!extracted.vNF || !extracted.vTotTrib) {
      return NextResponse.json(
        {
          error:
            "Nao foi possivel extrair os valores fiscais desta pagina SEFAZ. " +
            "O layout deste estado pode nao ser suportado. Faca o upload do XML como alternativa.",
        },
        { status: 422 }
      );
    }

    const vICMS = extracted.vICMS ?? 0;
    const vPIS  = extracted.vPIS ?? 0;
    const vCOFINS = extracted.vCOFINS ?? 0;

    // Monta um NFeParsed compátivel para o frontend
    const result = {
      chave: parsedUrl.searchParams.get("p")?.slice(0, 44) ?? "",
      emitente: {
        CNPJ: extracted.cnpj?.replace(/\D/g, "") ?? "00000000000000",
        xNome: extracted.xNome ?? "Emitente nao identificado",
        xFant: undefined,
        UF: extracted.UF ?? parsedUrl.hostname.split(".").find((p) => /^[A-Z]{2}$/.test(p)) ?? "BR",
        xMun: extracted.xMun ?? "",
      },
      dataEmissao: new Date().toISOString(),
      itens: [],
      totais: {
        vBC: extracted.vNF,
        vICMS,
        vPIS,
        vCOFINS,
        vIPI: undefined,
        vProd: extracted.vNF,
        vNF: extracted.vNF,
        vTotTrib: extracted.vTotTrib,
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Falha ao consultar a SEFAZ: ${msg}. Tente o upload do XML.` },
      { status: 502 }
    );
  }
}
