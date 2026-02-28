# Nota Real — Transparencia Fiscal

Plataforma de auditoria social e inteligencia fiscal. Traduz a complexidade do sistema tributario brasileiro em linguagem humana, permitindo que o cidadao visualize a carga tributaria efetiva, o destino dos recursos publicos e o impacto real do Estado na sua renda.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19 + React Compiler
- **Estilos:** Tailwind CSS 4.0
- **Validacao:** Zod 4
- **Animacoes:** Framer Motion
- **Linguagem:** TypeScript estrito (sem `any`)

## Funcionalidades

- **Socio Oculto:** calcula a carga patronal + descontos em holerite (INSS, IRPF, FGTS, Sistema S, RAT) com tabelas 2026 atualizadas
- **Consumo:** calculadora de impostos por produto em tempo real, com simulacao do regime hibrido EC 132/2023
- **Utilidades:** cascata fiscal de energia eletrica e agua (ICMS, PIS, COFINS, COSIP por UF)
- **NF-e Scanner:** parser de XML e consulta via chave de acesso (44 digitos)
- **Dashboard Hub:** hero number animado, funil financeiro, termometro orcamentario, Dia da Liberdade Fiscal
- **Onboarding:** intercept de regime (CLT/MEI/PJ) e renda com persistencia em localStorage
- **Glossario Fiscal:** painel lateral com tributos em linguagem humana (ICMS, PIS, COFINS, IBS, CBS, destino LOA)
- **Compartilhamento:** Web Share API nativa (mobile) com fallback para clipboard
- **Geolocalizacao:** deteccao automatica de UF via Geolocation API + Nominatim (zero hardcoding)
- **IBGE:** estados e municipios via API de Localidades

## Logica Fiscal 2026 (EC 132/2023)

O simulador implementa a **transicao hibrida obrigatoria**:

- Sistema legado (ICMS/PIS/COFINS/IPI) permanece **ativo e com aliquotas plenas**
- IVA Dual de teste (CBS 0,9% + IBS 0,1% = 1%) e cobrado **em paralelo**
- Carga total em 2026 = legado + 1% IVA — nao ha reducao de imposto ainda
- Substituicao progressiva do legado ocorre entre 2029 e 2032

## Arquitetura

```
src/
  types/      tax.ts · ibge.ts · nfe.ts · salary.ts · utility.ts  — contratos Zod + tipos TS
  services/   ibge.ts · geolocation.ts · nfe.ts · transparencia.ts
  lib/        tax-engine.ts · salary-engine.ts · utility-engine.ts · export-card.ts
  hooks/      use-toast.ts · use-estados.ts
  components/ sections/* · shell/* · tax/* · salary/* · utility/* · ui/*
  context/    impact-context.tsx
  app/        layout.tsx · page.tsx · globals.css · api/cgu/gastos/
```

## APIs Externas

| API | Uso |
|-----|-----|
| IBGE Localidades | Estados e municipios (zero hardcoding) |
| Nominatim (OSM) | Reverse geocoding para deteccao de UF |
| SEFAZ (via proxy `/api/nfe/[chave]`) | Consulta e parser de NF-e XML |
| CGU Transparencia (via proxy `/api/cgu/gastos`) | Gastos publicos por funcao (fallback LOA 2026) |

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
pnpm start
```

## Design System

Dark mode exclusivo. Paleta Zinc-950. Glassmorphism com gradient border via dual `background-clip`. Cores semanticas: Tax-Red `#EF4444`, Citizen-Green `#10B981`, Gov-Blue `#3B82F6`. Numeros em `font-mono font-bold tracking-tighter`.
