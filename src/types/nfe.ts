import { z } from "zod";

// ============================================================
// Chave de Acesso NF-e (44 digitos)
// Estrutura: cUF(2) AAMM(4) CNPJ(14) mod(2) serie(3) nNF(9) tpEmis(1) cNF(8) cDV(1)
// ============================================================
export const NFeChaveSchema = z
  .string()
  .length(44, "Chave de acesso deve ter exatamente 44 digitos")
  .regex(/^\d{44}$/, "Chave de acesso deve conter apenas digitos");

export const NFeChaveParsedSchema = z.object({
  cUF: z.string().length(2),
  aamm: z.string().length(4),
  cnpjEmitente: z.string().length(14),
  modelo: z.enum(["55", "65"]),
  serie: z.string().length(3),
  numero: z.string().length(9),
  tipoEmissao: z.string().length(1),
  codigoNumerico: z.string().length(8),
  digitoVerificador: z.string().length(1),
});

// ============================================================
// Tributos por item da NF-e
// ============================================================
export const NFeItemImpostoSchema = z.object({
  CST: z.string().optional(),
  vBC: z.number().optional(),
  pICMS: z.number().optional(),
  vICMS: z.number().optional(),
  pPIS: z.number().optional(),
  vPIS: z.number().optional(),
  pCOFINS: z.number().optional(),
  vCOFINS: z.number().optional(),
  pIPI: z.number().optional(),
  vIPI: z.number().optional(),
});

// ============================================================
// Item de produto na NF-e
// ============================================================
export const NFeItemSchema = z.object({
  nItem: z.number(),
  cProd: z.string(),
  xProd: z.string(),
  NCM: z.string(),
  CFOP: z.string(),
  uCom: z.string(),
  qCom: z.number(),
  vUnCom: z.number(),
  vProd: z.number(),
  imposto: NFeItemImpostoSchema,
});

// ============================================================
// Totais da NF-e (ICMSTot)
// ============================================================
export const NFeTotaisSchema = z.object({
  vBC: z.number(),
  vICMS: z.number(),
  vPIS: z.number(),
  vCOFINS: z.number(),
  vIPI: z.number().optional(),
  vProd: z.number(),
  vNF: z.number(),
  vTotTrib: z.number().optional(),
});

// ============================================================
// Emitente
// ============================================================
export const NFeEmitenteSchema = z.object({
  CNPJ: z.string(),
  xNome: z.string(),
  xFant: z.string().optional(),
  UF: z.string().length(2),
  xMun: z.string(),
});

// ============================================================
// Estrutura final parseada
// ============================================================
export const NFeParsedSchema = z.object({
  chave: NFeChaveSchema,
  emitente: NFeEmitenteSchema,
  dataEmissao: z.string(),
  itens: z.array(NFeItemSchema),
  totais: NFeTotaisSchema,
});

export type NFeChave = z.infer<typeof NFeChaveSchema>;
export type NFeChaveParsed = z.infer<typeof NFeChaveParsedSchema>;
export type NFeItemImposto = z.infer<typeof NFeItemImpostoSchema>;
export type NFeItem = z.infer<typeof NFeItemSchema>;
export type NFeTotais = z.infer<typeof NFeTotaisSchema>;
export type NFeEmitente = z.infer<typeof NFeEmitenteSchema>;
export type NFeParsed = z.infer<typeof NFeParsedSchema>;

export type NFeErrorCode =
  | "INVALID_KEY"
  | "INVALID_CHECK_DIGIT"
  | "FETCH_ERROR"
  | "PARSE_ERROR"
  | "NOT_FOUND"
  | "UNSUPPORTED_MODEL";

export interface NFeServiceError {
  code: NFeErrorCode;
  message: string;
}
