"use client";

import { getTableMeta } from "@/lib/table-freshness";

export function TableSourceNote() {
  const meta = getTableMeta();

  return (
    <div className="flex flex-col gap-1 mt-3">
      <p className="text-[11px] text-zinc-500 leading-tight">
        <span className="text-zinc-400 font-medium">INSS</span>
        {" · "}
        {meta.inssSource}
        {"  |  "}
        <span className="text-zinc-400 font-medium">IRPF</span>
        {" · "}
        {meta.irpfSource}
      </p>

      {meta.isStale && (
        <p className="text-[11px] text-amber-400 leading-tight">
          Tabela pode estar desatualizada — verificar portaria jan/{meta.year + 1}
        </p>
      )}
    </div>
  );
}
