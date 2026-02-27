# Claude Code Protocol: Nota Real

## General Rules
- **No Emotes:** Jamais utilize emojis ou emoticons em explicações, comentários de código ou mensagens de commit.
- **Seniority:** Atue como um Engenheiro Fullstack Sênior (ex-Vercel/Stripe). Respostas diretas, técnicas e sem preâmbulos.
- **Token Efficiency:** Utilize diffs ou atualizações parciais. Evite reescrever arquivos inteiros se apenas uma parte mudou.

## Development & Architecture Standards
- **Clean Code:** Siga rigorosamente SOLID, DRY e KISS.
- **Strict TypeScript:** Proibido o uso de `any`. Utilize `zod` para validar contratos de APIs externas e estruturas de NF-e.
- **Clean Architecture:** Separe lógica de negócio (services/hooks) da interface (components).
- **Zero Hardcoding:** Proibido o uso de arrays estáticos para dados geográficos, tributários ou categorias. Use obrigatoriamente as APIs (IBGE, BrasilAPI, IBPT).

## UI/UX Engineering (Stripe/Vercel Level)
- **Atrito Zero (Zero Friction):** Proibido criar formulários complexos. Priorize Geolocation API e busca semântica para preenchimento automático.
- **Elite Dark Theme:** Use exclusivamente a paleta Zinc (`zinc-950` para fundo, `zinc-900/50` para cards).
- **Visuals:** Implemente Glassmorphism, bordas de 1px translúcidas e efeitos de "Glow" sutil nas cores semânticas (Tax-Red, Citizen-Green, Gov-Blue).
- **Animations:** Use `framer-motion` para transições suaves de layout e carregamento de gráficos.

## External API & Data Integration
- **Geografia:** IBGE Localidades (Estados/Municípios).
- **NF-e:** Implementar parser de XML/HTML e consulta via chave de acesso (44 dígitos).
- **Tributação 2026:** Aplicar lógica da Reforma Tributária (CBS 0.9% + IBS 0.1% na transição) integrada ao legado.
- **Transparência:** API do Portal da Transparência (CGU) para rastrear o destino dos impostos.

## Fidelidade Fiscal
- **Proibido mostrar queda abrupta de impostos** na simulação de 2026 sem detalhar a transição progressiva (2026–2032).
- O regime `reforma_2026` no motor **DEVE** calcular: impostos legados (ICMS/PIS/COFINS/IPI) + nova camada de teste IVA (CBS 0,9% + IBS 0,1% = 1%). Nunca substituir — sempre empilhar.
- A UI **DEVE** exibir os dois sistemas de forma separada, com labels claros "Sistema Legado" e "IVA Dual — Fase de Teste".
- O glossário deve informar que IBS/CBS estão em transição de 7 a 10 anos e não substituem o legado em 2026.

## Sprint Workflow
1. **Análise de Contexto:** Verifique o MISSION.md antes de iniciar qualquer tarefa para alinhar o propósito da funcionalidade.
2. **Execução Modular:** Foque na sprint atual. Garanta tratamento de erro robusto (Try/Catch + UI Feedback) para todas as chamadas de API.
3. **Validação:** Otimização obrigatória via React Compiler. Verifique se os componentes são Client ou Server conforme a necessidade de interatividade.
4. **Git:** Mensagens de commit seguindo Conventional Commits (feat, fix, chore).

## Tech Specs
- Framework: Next.js 15 (App Router).
- Compiler: React Compiler (Habilitado).
- Styles: Tailwind CSS 4.0.
- State/Logic: React Hooks + Zod.