"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Apenas loga em dev — sem envio a terceiros
    if (process.env.NODE_ENV === "development") {
      console.error("[Nota Real] Erro nao capturado:", error);
    }
  }, [error]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 px-6 text-center">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-tax-red/20 bg-tax-red/5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
        Falha critica
      </p>
      <h1 className="mb-3 text-[18px] font-bold leading-tight tracking-tight text-white">
        Ocorreu um erro na auditoria dos dados.
      </h1>
      <p className="mb-8 max-w-xs text-[12px] leading-relaxed text-white/35">
        Um erro inesperado interrompeu a analise. Seus dados locais nao foram perdidos.
        {error.digest && (
          <span className="mt-2 block font-mono text-[10px] text-white/20">
            ref: {error.digest}
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={reset}
        className="rounded-2xl bg-white px-6 py-3 text-[13px] font-bold text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
