# MISSION.md: Nota Real — Plataforma de Transparência Fiscal

## 1. Visão Geral
O Nota Real é uma ferramenta de auditoria social e inteligência fiscal projetada para revelar o custo invisível do Estado Brasileiro. A plataforma traduz a complexidade tributária sobre o consumo, a renda e o patrimônio em dados compreensíveis, permitindo que o cidadão visualize o **"Sócio Oculto"** em cada aspecto de sua vida financeira.

## 2. Fluxo de Usuário: Elite UX (Zero Friction)
A experiência deve ser instantânea, eliminando barreiras burocráticas:
- **Raio-X NF-e:** Processamento de chaves de 44 dígitos com parser XML para extração de tributos item a item (Concluído).
- **Scanner de Contas (Novo):** Entrada de faturas de Energia e Água para revelar impostos em cascata (ICMS sobre PIS/COFINS) e taxas de iluminação pública.
- **Raio-X do Holerite:** Cálculo de retenções (IRPF/INSS) e encargos patronais invisíveis (FGTS, Sistema S) para mostrar o custo real do trabalho (Concluído).
- **Detecção Inteligente:** Geolocation API para UF (foco em Rondônia) e Município para aplicação automática de alíquotas de IPVA e IPTU.

## 3. Funcionalidades de Alto Impacto
- **Simulador da Reforma 2026 (Híbrido):** Exibição obrigatória da carga legada somada ao **1%** do IVA Dual de teste (CBS 0,9% + IBS 0,1%).
- **Calculadora de Esforço Laboral:** Conversão do imposto total em tempo de vida (horas/dias de trabalho) baseado na renda real do usuário (Concluído).
- **Calculadora de Patrimônio:** Impacto anual de impostos sobre bens (ex: IPVA para o Onix 2016 e IPTU residencial).
- **O Rastro do Sustento (Novo):** Decomposição do destino do imposto com base na LOA 2026:
    - **Previdência:** O peso das aposentadorias e pensões (maior fatia do orçamento).
    - **Benefícios Sociais:** Quanto sustenta programas como Bolsa Família e BPC.
    - **Máquina Pública:** Custo operacional dos Três Poderes e funcionalismo.
- **Dia da Liberdade de Impostos:** Contador anual que indica até qual dia do ano o usuário trabalhou exclusivamente para custear o governo.

## 4. O Mapa da Arrecadação Brasileira (Lista de Tributos 2026)

### 4.1 Esfera Federal (União)
- **IRPF:** Imposto sobre a renda pessoal.
- **IPI:** Imposto sobre produtos industrializados (saída da fábrica).
- **IOF:** Imposto sobre operações financeiras (crédito, câmbio, seguros).
- **II / IE:** Impostos sobre Importação e Exportação (incide em compras internacionais).
- **PIS / COFINS:** Contribuições sociais (em transição para a CBS).
- **CBS (Nova):** Contribuição sobre Bens e Serviços (0,9% de teste em 2026).
- **CSLL:** Contribuição Social sobre o Lucro Líquido (incidência indireta).

### 4.2 Esfera Estadual (Estados)
- **ICMS:** Imposto sobre mercadorias, energia, água e comunicação.
- **IPVA:** Imposto sobre a propriedade de veículos (ex: Onix 2016).
- **ITCMD:** Imposto sobre heranças e doações.
- **IBS Estadual (Novo):** Parcela estadual do IVA Dual (0,1% de teste em 2026).

### 4.3 Esfera Municipal (Municípios)
- **IPTU:** Imposto sobre propriedade territorial urbana.
- **ISS:** Imposto sobre serviços (streaming, profissionais liberais).
- **ITBI:** Imposto sobre transmissão de bens imóveis.
- **COSIP / CIP:** Taxa de iluminação pública (embutida na conta de luz).

## 5. Inteligência Fiscal — Regra de Transição 2026 (EC 132/2023)
Em 2026, o sistema opera em modo **HÍBRIDO**:
- O sistema legado (ICMS, PIS, COFINS, IPI, ISS) permanece **100% ativo**.
- O IVA Dual de teste (CBS 0,9% + IBS 0,1% = 1%) é cobrado **em paralelo**.
- **Fórmula:** Carga 2026 = (Tributos Atuais) + (1,0% Adicional de Teste).

## 6. UI/UX Protocol: Vercel/Stripe Level
- **Tema:** Dark Mode exclusivo (`Zinc-950`) com ruído (noise) de 2% de opacidade.
- **Ambient Auras (Glows):** Substituir gradientes por sombras amplas e sutis:
    - **Tax-Red:** `rgba(239, 68, 68, 0.08)` para impostos.
    - **Citizen-Green:** `rgba(16, 185, 129, 0.1)` para valor real.
- **Tipografia:** `Geist Sans` para interface e `Geist Mono` para valores monetários.

## 7. Estratégia de Sprints (Status 2026)

### Sprint 1, 2 & 3: Infraestrutura & Scanner (Concluído)
- Localização, Motor Fiscal Híbrido e Raio-X de notas fiscais.

### Sprint 4: Renda & Patrimônio (Concluído)
- Cálculo de IRPF/INSS 2026, encargos patronais e calculadoras de IPVA/IPTU.

### Sprint 5: Contas & Impacto Social (Próxima)
- Scanner de faturas de Energia/Água e integração com API do Portal da Transparência (CGU).

### Sprint 6: Auditoria & Performance
- Otimização via React Compiler e micro-interações Framer Motion.