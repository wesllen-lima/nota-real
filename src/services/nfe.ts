import { z } from "zod";
import {
  NFeChaveSchema,
  NFeChaveParsedSchema,
  NFeParsedSchema,
} from "@/types/nfe";
import type {
  NFeChaveParsed,
  NFeParsed,
  NFeServiceError,
} from "@/types/nfe";

// ============================================================
// Mapa de codigo IBGE de UF para sigla
// Extraido da estrutura da propria chave NF-e (padrão SEFAZ)
// Fonte: Nota Técnica 2014.002 - SEFAZ
// ============================================================
const IBGE_UF_CODE: Record<string, string> = {
  "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA",
  "16": "AP", "17": "TO", "21": "MA", "22": "PI", "23": "CE",
  "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE",
  "29": "BA", "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
  "41": "PR", "42": "SC", "43": "RS", "50": "MS", "51": "MT",
  "52": "GO", "53": "DF",
};

// Algoritmo mod-11 para verificacao do digito da chave NF-e
// Fonte: Manual de Orientacao ao Contribuinte NF-e v7.0
function calcDigitoVerificador(key43: string): number {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  for (let i = key43.length - 1; i >= 0; i--) {
    soma += parseInt(key43[i], 10) * pesos[(key43.length - 1 - i) % 8];
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validateChave(
  chave: string
): { valid: true; parsed: NFeChaveParsed } | { valid: false; error: NFeServiceError } {
  const trimmed = chave.replace(/\s/g, "");

  const keyResult = NFeChaveSchema.safeParse(trimmed);
  if (!keyResult.success) {
    return {
      valid: false,
      error: { code: "INVALID_KEY", message: keyResult.error.issues[0].message },
    };
  }

  const key = keyResult.data;
  const expectedDV = calcDigitoVerificador(key.slice(0, 43));
  if (expectedDV !== parseInt(key[43], 10)) {
    return {
      valid: false,
      error: {
        code: "INVALID_CHECK_DIGIT",
        message: `Digito verificador invalido. Esperado: ${expectedDV}`,
      },
    };
  }

  const modelo = key.slice(20, 22);
  if (modelo !== "55" && modelo !== "65") {
    return {
      valid: false,
      error: {
        code: "UNSUPPORTED_MODEL",
        message: `Modelo ${modelo} nao suportado. Use NF-e (55) ou NFC-e (65).`,
      },
    };
  }

  const parsedResult = NFeChaveParsedSchema.safeParse({
    cUF: key.slice(0, 2),
    aamm: key.slice(2, 6),
    cnpjEmitente: key.slice(6, 20),
    modelo: modelo as "55" | "65",
    serie: key.slice(22, 25),
    numero: key.slice(25, 34),
    tipoEmissao: key.slice(34, 35),
    codigoNumerico: key.slice(35, 43),
    digitoVerificador: key.slice(43, 44),
  });

  if (!parsedResult.success) {
    return {
      valid: false,
      error: { code: "INVALID_KEY", message: "Estrutura da chave invalida" },
    };
  }

  return { valid: true, parsed: parsedResult.data };
}

export function getUFFromChave(parsed: NFeChaveParsed): string {
  return IBGE_UF_CODE[parsed.cUF] ?? parsed.cUF;
}

function getTextContent(parent: Element, tag: string): string {
  return parent.querySelector(tag)?.textContent?.trim() ?? "";
}

function getNumberContent(parent: Element, tag: string): number {
  return parseFloat(getTextContent(parent, tag)) || 0;
}

export function parseNFeXml(
  xmlString: string
): { success: true; data: NFeParsed } | { success: false; error: NFeServiceError } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");

    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      return {
        success: false,
        error: { code: "PARSE_ERROR", message: "XML invalido ou malformado" },
      };
    }

    // Valida que o root é uma estrutura reconhecida de NF-e/NFC-e
    const rootTag = doc.documentElement?.tagName;
    if (!rootTag || (rootTag !== "nfeProc" && rootTag !== "NFe" && rootTag !== "nfce")) {
      return {
        success: false,
        error: {
          code: "PARSE_ERROR",
          message: "Arquivo XML nao reconhecido como Nota Fiscal. Esperado: nfeProc ou NFe",
        },
      };
    }

    const infNFe = doc.querySelector("infNFe");
    if (!infNFe) {
      return {
        success: false,
        error: { code: "PARSE_ERROR", message: "Elemento infNFe nao encontrado" },
      };
    }

    const chave = infNFe.getAttribute("Id")?.replace("NFe", "") ?? "";
    const emit = infNFe.querySelector("emit");
    const ide = infNFe.querySelector("ide");
    const icmsTot = infNFe.querySelector("ICMSTot");

    if (!emit || !ide || !icmsTot) {
      return {
        success: false,
        error: { code: "PARSE_ERROR", message: "Estrutura NF-e incompleta" },
      };
    }

    const emitente = {
      CNPJ: getTextContent(emit, "CNPJ"),
      xNome: getTextContent(emit, "xNome"),
      xFant: getTextContent(emit, "xFant") || undefined,
      UF: getTextContent(emit, "UF"),
      xMun: getTextContent(emit, "xMun"),
    };

    const detElements = infNFe.querySelectorAll("det");
    const itens = Array.from(detElements).map((det) => {
      const prod = det.querySelector("prod")!;
      const impostoEl = det.querySelector("imposto");
      const icms = impostoEl?.querySelector("ICMS");
      const pis = impostoEl?.querySelector("PIS");
      const cofins = impostoEl?.querySelector("COFINS");
      const ipi = impostoEl?.querySelector("IPI");

      return {
        nItem: parseInt(det.getAttribute("nItem") ?? "0", 10),
        cProd: getTextContent(prod, "cProd"),
        xProd: getTextContent(prod, "xProd"),
        NCM: getTextContent(prod, "NCM"),
        CFOP: getTextContent(prod, "CFOP"),
        uCom: getTextContent(prod, "uCom"),
        qCom: getNumberContent(prod, "qCom"),
        vUnCom: getNumberContent(prod, "vUnCom"),
        vProd: getNumberContent(prod, "vProd"),
        imposto: {
          vBC: icms ? getNumberContent(icms, "vBC") : undefined,
          pICMS: icms ? getNumberContent(icms, "pICMS") : undefined,
          vICMS: icms ? getNumberContent(icms, "vICMS") : undefined,
          pPIS: pis ? getNumberContent(pis, "pPIS") : undefined,
          vPIS: pis ? getNumberContent(pis, "vPIS") : undefined,
          pCOFINS: cofins ? getNumberContent(cofins, "pCOFINS") : undefined,
          vCOFINS: cofins ? getNumberContent(cofins, "vCOFINS") : undefined,
          pIPI: ipi ? getNumberContent(ipi, "pIPI") : undefined,
          vIPI: ipi ? getNumberContent(ipi, "vIPI") : undefined,
        },
      };
    });

    const totais = {
      vBC: getNumberContent(icmsTot, "vBC"),
      vICMS: getNumberContent(icmsTot, "vICMS"),
      vPIS: getNumberContent(icmsTot, "vPIS"),
      vCOFINS: getNumberContent(icmsTot, "vCOFINS"),
      vIPI: getNumberContent(icmsTot, "vIPI") || undefined,
      vProd: getNumberContent(icmsTot, "vProd"),
      vNF: getNumberContent(icmsTot, "vNF"),
      vTotTrib: getNumberContent(icmsTot, "vTotTrib") || undefined,
    };

    const result = NFeParsedSchema.safeParse({
      chave,
      emitente,
      dataEmissao: getTextContent(ide, "dhEmi") || getTextContent(ide, "dEmi"),
      itens,
      totais,
    });

    if (!result.success) {
      return {
        success: false,
        error: { code: "PARSE_ERROR", message: result.error.issues[0].message },
      };
    }

    return { success: true, data: result.data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "PARSE_ERROR",
        message: err instanceof Error ? err.message : "Erro desconhecido ao parsear XML",
      },
    };
  }
}
