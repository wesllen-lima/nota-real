"use client";

import { useRef, useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { exportIndignacaoCard } from "@/lib/export-card";

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface IndignacaoCardProps {
  totalTaxAmount: number;
  laborWorkHours: number | null;
  grossPrice: number;
}

export function IndignacaoCard({ totalTaxAmount, laborWorkHours, grossPrice }: IndignacaoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportIndignacaoCard(cardRef);
    } finally {
      setIsExporting(false);
    }
  }

  const taxPct = grossPrice > 0 ? ((totalTaxAmount / grossPrice) * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-3">
      {/* Card exportavel — background solido, sem glassmorphism */}
      <div
        ref={cardRef}
        style={{
          background: "#09090b",
          width: "480px",
          maxWidth: "100%",
          padding: "32px",
          borderRadius: "16px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Tag */}
        <p
          style={{
            color: "#ef4444",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          #NotaReal · Transparência Fiscal BR
        </p>

        {/* Destaque */}
        {laborWorkHours !== null && (
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", marginBottom: "8px" }}>
            Trabalhei
          </p>
        )}
        {laborWorkHours !== null ? (
          <p
            style={{
              color: "#ffffff",
              fontSize: "42px",
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: "4px",
              letterSpacing: "-0.03em",
            }}
          >
            {laborWorkHours.toFixed(1)}h
          </p>
        ) : (
          <p
            style={{
              color: "#ef4444",
              fontSize: "42px",
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: "4px",
              letterSpacing: "-0.03em",
            }}
          >
            {BRL(totalTaxAmount)}
          </p>
        )}
        {laborWorkHours !== null && (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginBottom: "24px" }}>
            só para o Governo.
          </p>
        )}

        {/* Valores */}
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
              Impostos pagos
            </span>
            <span
              style={{
                color: "#ef4444",
                fontSize: "16px",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {BRL(totalTaxAmount)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
              % do valor pago
            </span>
            <span style={{ color: "rgba(239,68,68,0.7)", fontSize: "13px", fontWeight: 600 }}>
              {taxPct}%
            </span>
          </div>
        </div>

        {/* Rodape */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "10px" }}>
            nota-real.vercel.app
          </p>
          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "10px" }}>
            Dados IBPT 2026 · EC 132/2023
          </p>
        </div>
      </div>

      {/* Botao exportar */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 text-[13px] font-medium text-white/60 transition-all hover:bg-white/[0.07] hover:text-white/80 disabled:opacity-40"
      >
        {isExporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Share2 size={14} />
        )}
        {isExporting ? "Gerando..." : "Compartilhar #NotaReal"}
      </button>
    </div>
  );
}
