# Nota Real

**Motor de auditoria fiscal para o contribuinte brasileiro.**

O Nota Real transforma a complexidade tributária em transparência radical: quanto do seu salário bruto o Estado captura, para onde vai cada centavo arrecadado, e quanto de imposto está embutido numa simples nota fiscal de supermercado ou conta de luz. Dados reais, em tempo real, sem invenção.

---

## O Propósito

### A Ilusão do Salário Bruto

Quando uma empresa contrata alguém por R$ 5.000 de salário bruto, o custo real que sai do caixa é substancialmente maior. INSS patronal (20%), RAT (2%), Sistema S (~5,8%), FGTS (8%) e as provisões de férias e 13º somam mais ~35% sobre o bruto antes de o trabalhador receber um centavo. O número que aparece na carteira é uma ficção contábil.

### O Sócio Oculto

O Nota Real usa a metáfora do "sócio oculto" para revelar esta estrutura. Dado um salário bruto, o motor calcula:

- **O custo real da empresa** (`realLaborCost`): o que saiu do caixa de verdade.
- **A carga tributária do Estado** (`totalTaxBurden`): apenas tributos capturados pelo governo — INSS patronal, RAT, Sistema S, FGTS, INSS do empregado e IRPF. Esta métrica exclui deliberadamente férias e 13º, que são direitos do trabalhador, não impostos.
- **As provisões trabalhistas** (`totalLaborProvisions`): separadas contabilmente, auditáveis e documentadas.
- **O salário líquido** (`netSalary`): o que cai na conta.

A equação fecha sem resíduo: `realLaborCost − totalTaxBurden − totalLaborProvisions = netSalary`.

### A Auditoria Social

Além do salário, o sistema audita o consumo (NF-e e NFC-e) e as utilidades domésticas (energia elétrica e água), e rastreia o destino dos impostos via API do Portal da Transparência do Governo Federal. O objetivo é dar ao contribuinte o mesmo nível de detalhe que a Receita Federal tem sobre ele.

---

## O Desafio de Engenharia

### Regra Zero: Proibido Inventar Dados

A restrição mais importante do projeto não é técnica, é filosófica: **nenhum dado pode ser fabricado**. Nenhum mock, nenhum JSON estático de alíquotas por estado, nenhuma simulação que pareça dado real. Se uma API falhar, o sistema falha visivelmente e solicita ação manual ao usuário. Esta regra eliminou diversas abordagens "mais simples" durante o desenvolvimento.

A consequência prática mais direta: o ICMS de energia elétrica e água nunca é um dicionário `{ SP: 0.12, RJ: 0.18, ... }` hardcoded no código. É um valor consultado em tempo real na API do IBPT cruzando o NCM do serviço com a UF detectada por geolocalização.

### O Bloqueio da SEFAZ e os Dois Fluxos Reais

A consulta direta de NF-e por chave de acesso na SEFAZ exige certificado digital A1/A3. Sem ele, a API retorna 403. A solução adotada são dois fluxos completamente independentes que nunca tocam neste endpoint bloqueado:

**Fluxo 1 — Upload de XML (Desktop):**
O arquivo `.xml` da nota fiscal é processado integralmente no cliente via `DOMParser`. O parser extrai `<ICMSTot>`, `<emit>` e `<det>`, e valida a estrutura do documento antes de aceitar qualquer dado. Se o XML não contiver `<nfeProc>` ou `<NFe>` como elemento raiz, é rejeitado com erro descritivo. Nunca silenciosamente.

**Fluxo 2 — Scanner de QR Code (Mobile):**
NFC-e (modelo 65) imprimem um QR Code que aponta para a URL pública do portal SEFAZ de cada estado. O scanner usa a `BarcodeDetector` API nativa (com fallback gracioso em navegadores sem suporte) para capturar essa URL. O backend (`/api/nfe/scrape`) então:

1. Valida que o host termina em `.gov.br` (primeira camada — rejeita qualquer domínio não-governamental).
2. Verifica o host contra uma whitelist explícita de portais SEFAZ estaduais (segunda camada).
3. Faz `fetch` do HTML público com `AbortSignal.timeout(10_000)`.
4. Extrai os valores fiscais via regex multi-padrão, resiliente para diferentes layouts estaduais.
5. Retorna 422 com mensagem descritiva se não conseguir parsear — nunca inventa valores.

```
QR Code → URL SEFAZ pública
         → POST /api/nfe/scrape
           → host.endsWith(".gov.br")       [camada 1]
           → SEFAZ_ALLOWED_HOSTS.has(host)  [camada 2]
           → fetch HTML + regex parser
           → { vNF, vTotTrib, vICMS, vPIS, vCOFINS }  ou  422
```

### ICMS Dinâmico via IBPT + Geolocalização

Para calcular corretamente o imposto sobre energia elétrica e água, o sistema precisa da alíquota de ICMS do estado do usuário — que varia de 0% a ~35% dependendo da UF e do tipo de serviço.

O fluxo é:

1. `navigator.geolocation` captura as coordenadas do usuário.
2. Nominatim (OpenStreetMap) converte as coordenadas para UF via reverse geocoding, extraindo `address["ISO3166-2-lvl4"]` → `"BR-SP"` → `"SP"`.
3. Um proxy backend (`/api/ibpt/ncm/[ncm]?uf=SP`) consulta `api.ibpt.org.br` enviando o NCM do serviço e a UF.
   - Energia elétrica: NCM `27160000`
   - Água/saneamento: NCM `22011000`
4. A alíquota retornada é injetada diretamente em `calculateUtilityTax()` em tempo real.

Se a API do IBPT estiver offline, o sistema usa médias nacionais documentadas como fallback (nunca como dado primário) e sinaliza visualmente ao usuário a origem estimada. O `AbortSignal.timeout(5_000)` garante que o fallback seja acionado em até 5 segundos.

### Transição 2026 — IVA Dual

O regime `reforma_2026` implementa a transição da EC 132/2023. A regra é invariável: nunca substituir os tributos legados, sempre empilhar. CBS (0,9%) e IBS (0,1%) são calculados sobre o valor total da nota e somados à carga já existente de ICMS, PIS e COFINS.

`totalRate_2026 = legacyRate + 0.01`

A carga total é sempre maior no modo de transição. Isso é matematicamente correto e juridicamente esperado neste período.

---

## Blindagem Contábil e Legal

### Frações Exatas, Não Decimais Truncados

As provisões trabalhistas usam frações matemáticas exatas, não aproximações decimais:

| Provisão | Errado | Correto | Prova |
|---|---|---|---|
| Férias + 1/3 constitucional | `0.1111` | `1 / 9` | `(1/12) × (4/3) = 4/36 = 1/9 = 0.111111…` |
| 13º Salário | `0.0833` | `1 / 12` | `1/12 = 0.083333…` |

Para um salário de R$ 15.000, a diferença acumulada é de R$ 1,00/mês por trabalhador. Em folha de pagamento, esse desvio é um erro contábil documentável. O motor não o comete.

Fonte: Art. 7º, XVII/XIX, CF/1988 + Súmula 328/TST (férias) — Lei 4.749/1965 (13º).

### INSS Progressivo — Não Uma Tabela Plana

O `calcInss()` é verdadeiramente progressivo: cada alíquota incide apenas sobre a parcela do salário dentro da faixa correspondente, nunca sobre o salário integral.

| Faixa | Alíquota | Teto da faixa |
|---|---|---|
| 1ª | 7,5% | R$ 1.621,00 |
| 2ª | 9,0% | R$ 2.902,84 |
| 3ª | 12,0% | R$ 4.354,27 |
| 4ª | 14,0% | R$ 8.475,55 (teto) |

O desconto é sempre limitado a R$ 988,09, independente do salário. Fonte: Portaria Interministerial MPS/MF n.13, DOU 09/01/2026.

### IRPF em Dois Passos Independentes

O cálculo do IRPF combina duas leis vigentes em sequência:

**Passo 1 — Tabela progressiva** (Lei 15.191/2025):
`imposto_bruto = max(0, base × alíquota − parcela_a_deduzir)`
A parcela é a equivalência matemática exata do cálculo progressivo — o método oficial da Receita Federal. Alíquota máxima: 27,5% acima de R$ 4.664,68.

**Passo 2 — Redutor linear** (Lei 15.270/2025):
Aplicado sobre o salário bruto (não sobre a base). Renda ≤ R$ 5.000 zera o IRPF integralmente. Entre R$ 5.000 e R$ 7.350: `reducao = 978,62 − 0,133145 × renda_bruta`. Acima de R$ 7.350: sem redução.

Verificação: `978,62 − 0,133145 × 7350 ≈ 0` — a transição é suave no limite superior.

### O Código como Jurisprudência

Cada constante e função de cálculo carrega JSDoc citando a fonte legal de onde deriva. O código é a sua própria bibliografia jurídica:

```typescript
/**
 * Fonte: Portaria Interministerial MPS/MF n.13, DOU 09/01/2026.
 * Teto: R$ 8.475,55 | Desconto maximo: R$ 988,09.
 * Metodo: progressivo — cada aliquota incide apenas sobre a parcela na faixa.
 */
function calcInss(grossSalary: number): number { ... }

// INSS Patronal 20% — Art. 22, I, Lei 8.212/1991
// RAT 2%          — Art. 22, II, Lei 8.213/1991 + Decreto 3.048/1999 Anexo V
// FGTS 8%         — Art. 15, Lei 8.036/1990
// CBS/IBS 2026    — EC 132/2023, Art. 124 + LC 214/2024
```

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime | React + React Compiler | 19.2.3 |
| Linguagem | TypeScript strict (`any` proibido) | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Componentes | shadcn/ui + Radix UI | — |
| Animações | Framer Motion | 12.x |
| Validação de contratos | Zod | 4.x |
| Gráficos | Recharts | 3.x |
| Testes | Vitest + @vitest/coverage-v8 | 4.x |
| Export | html-to-image + Web Share API | — |
| Pacotes | pnpm | — |

---

## Arquitetura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── ibpt/ncm/[ncm]/route.ts   # Proxy IBPT — ICMS por NCM + UF em tempo real
│   │   ├── cgu/gastos/route.ts        # Proxy CGU — destino do orçamento federal
│   │   └── nfe/scrape/route.ts        # Scraper SEFAZ — extração do HTML público da NFC-e
│   ├── error.tsx                       # Error boundary global (zinc-950, botão reset)
│   └── not-found.tsx                  # 404 customizado
│
├── config/
│   └── salary-tables-2026.ts          # Faixas INSS/IRPF 2026 com JSDoc legal completo
│
├── lib/
│   ├── salary-engine.ts               # Motor CLT — INSS progressivo + IRPF dois passos
│   ├── utility-engine.ts              # Motor utilidades — ICMS/PIS/COFINS/COSIP + IVA dual
│   ├── tax-engine.ts                  # Motor consumo — NF-e + regimes atual/reforma_2026
│   └── export-card.ts                 # html-to-image + Web Share File API
│
├── services/
│   ├── nfe.ts                         # Parser XML + validação chave mod-11 (44 dígitos)
│   ├── transparencia.ts               # Equivalências sociais — merenda, UTI, vacinas
│   └── ibpt.ts                        # Cliente API IBPT com fallback
│
├── hooks/
│   ├── use-nfe-scanner.ts             # Estado do scanner: upload XML + QR code camera
│   ├── use-utility-calculator.ts      # Async: busca IBPT antes de calcular
│   └── use-ibpt-rates.ts              # Hook de alíquotas por NCM com source "ibpt_live"
│
└── tests/
    ├── salary-engine.test.ts          # 14 testes — INSS progressivo, IRPF, invariantes
    ├── utility-engine.test.ts         # 9 testes — cascata ICMS, IVA dual, fallbacks
    ├── tax-engine.test.ts             # 12 testes — consumo, reforma 2026
    └── table-freshness.test.ts        # 8 testes — validade temporal das tabelas legais
```

---

## Variáveis de Ambiente

```bash
# Chave da API IBPT — obtida em api.ibpt.org.br
# Sem esta chave, o sistema usa médias nacionais CONFAZ como fallback.
IBPT_TOKEN=sua_chave_aqui

# Chave da API CGU — Portal da Transparência do Governo Federal
# Sem esta chave, o sistema usa os dados da LOA 2026 (Lei 14.903/2024) como fallback.
CGU_API_KEY=sua_chave_aqui
```

Ambas têm fallback automático e documentado. O sistema não quebra sem as chaves — degrada graciosamente e sinaliza a origem dos dados na interface.

---

## Rodando Localmente

```bash
# Clonar e instalar
git clone https://github.com/seu-usuario/nota-real.git
cd nota-real
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# editar .env.local com IBPT_TOKEN e CGU_API_KEY

# Desenvolvimento
pnpm dev
# → http://localhost:3000

# Build de produção
pnpm build && pnpm start

# Type-check
pnpm tsc --noEmit
```

---

## Testes

```bash
pnpm test:run       # executa os 43 testes uma vez
pnpm test           # modo watch
pnpm test:coverage  # relatório de cobertura
```

**43 testes, 4 suites, zero tolerância a falha.** Cobertura concentrada nos motores de cálculo — onde um centavo errado é um erro contábil.

Os testes de motor salarial verificam invariantes matemáticos rígidos:

```
inssEmployee + irpfAmount + netSalary  ==  grossSalary          (±R$ 0,01)
totalTaxBurden + totalLaborProvisions  ==  realLaborCost − netSalary
INSS                                   <=  R$ 988,09             (qualquer salário)
irpfAmount                             ==  0                     (bruto ≤ R$ 5.000)
```

---

## Legislação de Referência

| Norma | Assunto |
|---|---|
| Portaria Interministerial MPS/MF n.13/2026 | Tabela INSS 2026 — faixas e teto |
| Lei 15.191/2025 | Tabela IRPF — alíquotas e parcelas dedutoras |
| Lei 15.270/2025 | Redutor linear IRPF — isenção até R$ 5.000 |
| Lei 8.212/1991, Art. 22 | INSS Patronal 20% |
| Lei 8.213/1991 + Decreto 3.048/1999 | RAT — Risco de Acidente de Trabalho |
| Lei 8.036/1990, Art. 15 | FGTS 8% |
| Lei 4.749/1965 + Art. 7º, VIII, CF/1988 | 13º Salário |
| Art. 7º, XVII/XIX, CF/1988 + Súmula 328/TST | Férias + 1/3 constitucional |
| Decreto 5.442/2005 | PIS/COFINS energia elétrica (não-cumulativo) |
| IN RFB 2.121/2022 | PIS/COFINS saneamento (cumulativo) |
| Convênio ICMS 110/2021 + STJ RE 949.297/SP | ICMS energia — base "por dentro" (efeito cascata) |
| EC 132/2023, Art. 124 + LC 214/2024 | IVA Dual — CBS e IBS (transição 2026) |
| Lei 14.903/2024 | LOA 2026 — orçamento federal de referência |
