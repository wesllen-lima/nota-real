"use client";

import { clsx } from "clsx";
import { useAppContext, type DrawerId } from "@/context/impact-context";
import { NAV_ITEMS } from "./app-sidebar";

export function BottomNav() {
  const { openDrawer, setOpenDrawer } = useAppContext();

  function handleNav(id: string) {
    if (id === "dashboard") {
      setOpenDrawer(null);
    } else {
      setOpenDrawer(id as DrawerId);
    }
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-white/[0.05] bg-zinc-950/90 backdrop-blur-xl md:hidden">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = id === "dashboard" ? openDrawer === null : openDrawer === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleNav(id)}
            className={clsx(
              "relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
              isActive ? "text-gov-blue" : "text-white/30 hover:text-white/55"
            )}
          >
            {isActive && (
              <span className="absolute inset-x-2 inset-y-1 rounded-xl bg-white/[0.06]" />
            )}
            <Icon
              size={18}
              className={clsx("relative transition-colors", isActive ? "text-gov-blue" : "text-white/30")}
            />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
