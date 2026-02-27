"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { useAppContext } from "@/context/impact-context";
import { SalaryDashboard } from "@/components/salary/salary-dashboard";
import type { SalaryBreakdown } from "@/types/salary";

type SalaryTab = "empregado" | "empregador";

const TABS: Array<{ id: SalaryTab; label: string }> = [
  { id: "empregado", label: "Empregado" },
  { id: "empregador", label: "Empregador" },
];

export function TrabalhoSection() {
  const [activeTab, setActiveTab] = useState<SalaryTab>("empregado");
  const { setSalaryResult } = useAppContext();

  function handleResult(r: SalaryBreakdown | null) {
    setSalaryResult(r);
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      {/* Tab switcher */}
      <div className="flex gap-2 self-start">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={clsx(
              "rounded-xl px-4 py-2 text-[12px] font-medium transition-all duration-150",
              activeTab === id
                ? "border border-gov-blue/30 bg-gov-blue/10 text-gov-blue"
                : "border border-white/6 bg-white/3 text-white/35 hover:bg-white/6 hover:text-white/55"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <SalaryDashboard activeTab={activeTab} onResult={handleResult} />
    </div>
  );
}
