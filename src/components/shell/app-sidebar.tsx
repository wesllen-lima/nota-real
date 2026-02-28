"use client";

import { LayoutDashboard, ShoppingCart, Briefcase, Zap, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import { useAppContext, type DrawerId } from "@/context/impact-context";

export const NAV_ITEMS: Array<{
  id: "dashboard" | DrawerId & string;
  label: string;
  Icon: typeof LayoutDashboard;
}> = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "consumo", label: "Consumo", Icon: ShoppingCart },
  { id: "trabalho", label: "Trabalho", Icon: Briefcase },
  { id: "utilidades", label: "Utilidades", Icon: Zap },
];

export function AppSidebar() {
  const { openDrawer, setOpenDrawer, glossaryOpen, setGlossaryOpen } = useAppContext();

  function handleNav(id: string) {
    if (id === "dashboard") {
      setOpenDrawer(null);
    } else {
      setOpenDrawer(id as DrawerId);
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/[0.09] bg-zinc-950 backdrop-blur-xl md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span
          className="text-[18px] font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #d4d4d8 0%, #ffffff 50%, #e4e4e7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Nota Real
        </span>
      </div>

      <div className="h-px bg-white/[0.05]" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = id === "dashboard" ? openDrawer === null : openDrawer === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNav(id)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "border border-gov-blue/25 bg-gov-blue/12 text-gov-blue"
                  : "border border-transparent text-white/35 hover:bg-white/[0.04] hover:text-white/60"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2 px-3 pb-5">
        <button
          type="button"
          onClick={() => setGlossaryOpen(!glossaryOpen)}
          className={clsx(
            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-medium transition-all duration-150",
            glossaryOpen
              ? "border-gov-blue/25 bg-gov-blue/12 text-gov-blue"
              : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/60"
          )}
        >
          <BookOpen size={13} className="shrink-0" />
          Glossario
        </button>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
            Reforma Tributaria
          </p>
          <p className="mt-1 text-[11px] text-white/35">EC 132/2023</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-white/35">
            Transicao 2026–2032. CBS + IBS em fase de teste.
          </p>
        </div>
      </div>
    </aside>
  );
}
