import { TaxCalculator } from "@/components/tax/tax-calculator";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient light — spots ultra-suaves nos cantos */}
      <div className="ambient-top-right pointer-events-none fixed inset-0 z-0" />
      <div className="ambient-bottom-left pointer-events-none fixed inset-0 z-0" />

      {/* Noise texture — 2.5% opacity, cobre toda a tela */}
      <div className="noise pointer-events-none fixed inset-0 z-10 opacity-[0.02]" />

      <main className="relative z-20 flex min-h-screen flex-col items-center px-4 py-14 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-14 flex flex-col items-center gap-5 text-center">
          {/* Chip de contexto */}
          <div className="chip-glass rounded-full px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
            Transparencia Fiscal — Brasil 2026
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              <span
                style={{
                  background: "linear-gradient(135deg, #d4d4d8 0%, #ffffff 50%, #e4e4e7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Nota
              </span>
              {" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a1a1aa 0%, #ffffff 60%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Real
              </span>
            </h1>
            <p className="max-w-xs text-[13px] leading-relaxed text-white/30">
              Quanto voce realmente paga — e para onde vai cada centavo.
            </p>
          </div>

          {/* Indicadores de legenda */}
          <div className="flex items-center gap-4 text-[11px] text-white/35">
            <span className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-citizen-green opacity-80" />
              Preco Real
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-tax-red opacity-80" />
              Impostos
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-gov-blue opacity-80" />
              Federal
            </span>
          </div>
        </header>

        {/* Calculadora */}
        <TaxCalculator />

        {/* Footer */}
        <footer className="mt-24 flex flex-col items-center gap-1 text-center">
          <p className="text-[11px] text-white/18">
            Aliquotas IBPT 2024/2025 · Reforma EC 132/2023 · IBGE Localidades API
          </p>
          <p className="text-[10px] text-white/12">
            Valores educacionais — nao constituem consultoria tributaria
          </p>
        </footer>
      </main>
    </div>
  );
}
