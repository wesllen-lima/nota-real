import { z } from "zod";
import {
  EstadosResponseSchema,
  MunicipiosResponseSchema,
} from "@/types/ibge";
import type { Estado, Municipio } from "@/types/ibge";

const IBGE_API_BASE =
  "https://servicodados.ibge.gov.br/api/v1/localidades";

async function ibgeFetch<T>(
  url: string,
  schema: z.ZodType<T>
): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 86400 }, // cache por 24h - dados geograficos sao estaveis
  });
  if (!res.ok) {
    throw new Error(`IBGE API erro ${res.status}: ${url}`);
  }
  const raw = await res.json();
  return schema.parse(raw);
}

export async function fetchEstados(): Promise<Estado[]> {
  return ibgeFetch(
    `${IBGE_API_BASE}/estados?orderBy=nome`,
    EstadosResponseSchema
  );
}

export async function fetchMunicipiosByUF(uf: string): Promise<Municipio[]> {
  return ibgeFetch(
    `${IBGE_API_BASE}/estados/${uf}/municipios?orderBy=nome`,
    MunicipiosResponseSchema
  );
}

export async function fetchEstadoByUF(uf: string): Promise<Estado | null> {
  const estados = await fetchEstados();
  return estados.find((e) => e.sigla === uf.toUpperCase()) ?? null;
}
