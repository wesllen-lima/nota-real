import { z } from "zod";

export const RegiaoSchema = z.object({
  id: z.number(),
  sigla: z.string(),
  nome: z.string(),
});

export const EstadoSchema = z.object({
  id: z.number(),
  sigla: z.string().length(2),
  nome: z.string(),
  regiao: RegiaoSchema,
});

export const MunicipioSchema = z.object({
  id: z.number(),
  nome: z.string(),
  microrregiao: z.object({
    id: z.number(),
    nome: z.string(),
    mesorregiao: z.object({
      id: z.number(),
      nome: z.string(),
      UF: EstadoSchema,
    }),
  }),
  "regiao-imediata": z
    .object({
      id: z.number(),
      nome: z.string(),
    })
    .optional(),
});

export const EstadosResponseSchema = z.array(EstadoSchema);
export const MunicipiosResponseSchema = z.array(MunicipioSchema);

export type Estado = z.infer<typeof EstadoSchema>;
export type Municipio = z.infer<typeof MunicipioSchema>;
