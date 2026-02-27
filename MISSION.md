# MISSION.md: Nota Real — Plataforma de Transparência Fiscal

## 1. Visão Geral
O Nota Real é uma ferramenta de auditoria social e inteligência fiscal projetada para traduzir a complexidade do sistema tributário brasileiro em linguagem humana. A plataforma fornece clareza imediata sobre o custo real do consumo, permitindo que o cidadão visualize a carga tributária efetiva e o destino dos recursos públicos através de uma interface de elite (Stripe/Vercel level).

## 2. Fluxo de Usuário: Atrito Zero (Zero Friction)
A experiência deve ser instantânea e baseada em dados reais, eliminando barreiras burocráticas.
- **Leitura de NF-e:** Entrada via chave de acesso (44 dígitos) ou captura de QR Code. O sistema realiza o parser do XML/HTML para extrair tributos item a item.
- **Detecção Automática:** Uso de Geolocation API para identificar UF/Município no primeiro acesso e aplicar alíquotas regionais.
- **Entrada Manual Inteligente:** Campo de valor único com busca semântica de produtos (ex: "Gasolina", "Arroz").
- **Cálculo Progressivo:** Atualização em tempo real dos gráficos e do "Preço Real" conforme a interação.

## 3. Funcionalidades de Alto Impacto (Core Features)
- **Scanner de Nota Fiscal (Raio-X):** Decomposição total de notas fiscais reais em "Valor do Produto" vs "Fatia do Governo".
- **Simulador da Reforma 2026:** Comparativo dinâmico na própria nota entre o sistema antigo (ICMS/PIS/COFINS) e o novo IVA Dual (IBS/CBS - alíquota teste de 1%).
- **Conversão em Horas de Trabalho:** Tradução do imposto pago em tempo de esforço laboral baseado na renda informada.
- **Rastro Social do Imposto:** Conexão entre o tributo pago e a entrega pública (Ex: "O imposto desta nota equivale a X merendas escolares em sua cidade").
- **Personal Tax Tracker:** Dashboard histórico que consolida todos os impostos pagos em notas escaneadas pelo usuário.

## 4. Glossário para o Cidadão (Linguagem Humana)
- **ICMS:** Imposto estadual sobre a circulação de mercadorias e serviços.
- **IBS / CBS:** Os novos impostos da Reforma de 2026 (IVA Dual). O IBS é subnacional e a CBS é federal.
- **PIS / COFINS:** Contribuições federais destinadas à seguridade social e assistência.
- **IPI:** Imposto sobre produtos que saem das fábricas (Industrializados).
- **IBPT:** Base de dados oficial que estima a carga tributária média por NCM (Nomenclatura Comum do Mercosul).

## 5. UI/UX Protocol: Elite Dark Dashboard (2026 Standards)
- **Tema:** Dark Mode exclusivo utilizando paleta `Zinc-950`.
- **Estética:** Glassmorphism com bordas de 1px translúcidas (`border-zinc-800/50`) e `backdrop-blur`.
- **Paleta Semântica & Glows:**
    - **Tax-Red:** `#EF4444` (Glow para impostos e saídas).
    - **Citizen-Green:** `#10B981` (Glow para valor real e economia).
    - **Gov-Blue:** `#3B82F6` (Glow para dados oficiais e transparência).
- **Tipografia:** Geist Sans para interface; fontes mono-espaçadas para dados financeiros e chaves de NF-e.
- **Animações:** Feedback tátil e visual via Framer Motion em transições de layout.

## 5.1 Inteligência Fiscal — Regra de Transição Híbrida (EC 132/2023)

Em 2026 o sistema tributário brasileiro opera em **modo HÍBRIDO obrigatório**:

- O sistema **legado** (ICMS, PIS, COFINS, IPI, ISS) permanece **100% ativo** com alíquotas plenas.
- O **IVA Dual de teste** (CBS 0,9% + IBS 0,1% = 1%) é cobrado **em paralelo**, sobre a mesma base.
- O período de transição completo é **2026–2032** (7 anos). Apenas em **2033** o sistema legado começa
  a ser extinto progressivamente.
- Em 2026 o contribuinte paga: **carga legada + 1% IVA = carga TOTAL maior** que apenas o regime atual.

**Implicação para o simulador:**
A simulação `reforma_2026` NUNCA deve mostrar queda de imposto. Deve exibir:
1. Fatia "Sistema Legado" (ICMS/PIS/COFINS/IPI) — idêntica ao regime atual
2. Fatia "IVA Dual — Fase de Teste" (CBS + IBS) — 1% adicional de forma explícita
3. Total combinado, provando que a simplificação ainda não reduziu a carga em 2026

## 6. Estratégia de Sprints

### Sprint 1: Infraestrutura e APIs de Localização
- Implementação de `src/services/` para consumo de APIs do IBGE e Geolocation.
- **Regra de Ouro:** Proibido qualquer dado geográfico ou tributário hardcoded.

### Sprint 2: Motor NF-e e Inteligência Fiscal
- Implementação de serviço para consulta e parser de NF-e (via BrasilAPI ou integração SEFAZ).
- Atualização do `tax-engine.ts` para processar arrays de itens e transição para Reforma 2026.

### Sprint 3: Core UI & Elite Design System
- Setup Tailwind 4.0 e componentes shadcn/ui customizados para Dark/Zinc.
- Implementação do Layout principal com Glassmorphism e navegação fluida.

### Sprint 4: Visualização e Dashboards de Impacto
- Gráficos Recharts com gradientes e áreas de glow para "Fatia do Governo".
- Implementação da feature de "Horas de Trabalho" e "Rastro Social".

### Sprint 5: Auditoria, Performance e Deploy
- Painel de auditoria detalhado por item e memória de cálculo.
- Otimização extrema via React Compiler e monitoramento de performance.

## 7. Fontes de Dados (Vigência 2026)
- **Geografia:** API de Localidades do IBGE.
- **Notas Fiscais:** BrasilAPI / Integrações diretas de consulta NF-e.
- **Tributação:** API IBPT (Tabelas 2026).
- **Gastos Públicos:** API do Portal da Transparência (CGU).

## 8. Protocolo de Engenharia
- **Arquitetura:** Clean Architecture (Separação entre Services, Hooks e Components).
- **Segurança:** Chaves de acesso e dados sensíveis de notas fiscais tratados com criptografia em repouso.
- **Performance:** Uso obrigatório de React Server Components (RSC) para processamento de dados e Next.js Turbo para build.
- **Qualidade:** TypeScript Estrito com validação de contratos de API via Zod.