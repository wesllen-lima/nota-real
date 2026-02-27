# Nota Real — Transparencia Fiscal

Plataforma de auditoria social e inteligência fiscal. Traduz a complexidade do sistema tributário brasileiro em linguagem humana, permitindo que o cidadão visualize a carga tributária efetiva e o destino dos recursos públicos.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19 + React Compiler
- **Estilos:** Tailwind CSS 4.0
- **Validacao:** Zod 4
- **Animacoes:** Framer Motion
- **Graficos:** Recharts
- **Linguagem:** TypeScript estrito (sem `any`)

## Funcionalidades

- Calculadora de carga tributaria em tempo real por categoria de produto
- Simulador da Reforma Tributaria 2026 (regime hibrido EC 132/2023)
- Scanner de Nota Fiscal via chave de acesso (44 digitos) com parser XML
- Deteccao automatica de UF via Geolocation API + Nominatim
- Estados e municipios via IBGE Localidades API (zero hardcoding geografico)
- Glossario fiscal em linguagem humana (ICMS, PIS, COFINS, IBS, CBS)

## Logica Fiscal 2026 (EC 132/2023)

O simulador implementa a **transicao hibrida obrigatoria**:

- Sistema legado (ICMS/PIS/COFINS/IPI) permanece **ativo e com aliquotas plenas**
- IVA Dual de teste (CBS 0,9% + IBS 0,1% = 1%) e cobrado **em paralelo**
- Carga total em 2026 = legado + 1% IVA — nao ha reducao de imposto ainda
- Substituicao progressiva do legado ocorre entre 2029 e 2032

## Arquitetura

```
src/
  types/      tax.ts · ibge.ts · nfe.ts          — contratos Zod + tipos TS
  services/   ibge.ts · geolocation.ts · nfe.ts  — integracao com APIs externas
  lib/        tax-engine.ts · utils.ts            — logica de negocio pura
  hooks/      use-tax-calculator.ts · use-estados.ts
  components/ tax/* · ui/*
  app/        layout.tsx · page.tsx · globals.css
```

## APIs Externas

| API | Uso |
|-----|-----|
| IBGE Localidades | Estados e municipios (sem hardcoding) |
| Nominatim (OSM) | Reverse geocoding para deteccao de UF |
| SEFAZ (via proxy `/api/nfe/[chave]`) | Consulta e parser de NF-e XML |
| IBPT | Aliquotas por NCM (override externo no motor) |

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

Dark mode exclusivo. Paleta Zinc-950. Glassmorphism com gradient border via dual `background-clip`. Cores semanticas: Tax-Red `#EF4444`, Citizen-Green `#10B981`, Gov-Blue `#3B82F6`.
