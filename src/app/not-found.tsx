import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 px-6 text-center">
      <div className="mb-6">
        <p className="font-mono text-[64px] font-bold leading-none tracking-tighter text-white/[0.06]">
          404
        </p>
      </div>

      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
        Pagina nao encontrada
      </p>
      <h1 className="mb-3 text-[18px] font-bold leading-tight tracking-tight text-white">
        Esta rota nao existe.
      </h1>
      <p className="mb-8 max-w-xs text-[12px] leading-relaxed text-white/35">
        O link que voce acessou pode estar desatualizado ou a pagina foi removida.
      </p>

      <Link
        href="/"
        className="rounded-2xl bg-white px-6 py-3 text-[13px] font-bold text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
