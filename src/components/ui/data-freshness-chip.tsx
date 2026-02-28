import type { IbptSource } from "@/services/ibpt";

interface DataFreshnessChipProps {
  source: IbptSource;
  updatedAt?: number; // timestamp em ms
}

export function DataFreshnessChip({ source, updatedAt }: DataFreshnessChipProps) {
  const isLive = source === "ibpt_live";

  const label = isLive ? "IBPT ao vivo" : "IBPT 2025 \u00B7 Padrao";

  const timeLabel =
    isLive && updatedAt
      ? new Date(updatedAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <span
      className={[
        "chip-glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium",
        isLive ? "text-citizen-green" : "text-white/30",
      ].join(" ")}
    >
      <span
        className={[
          "h-[5px] w-[5px] rounded-full",
          isLive ? "bg-citizen-green" : "bg-white/25",
        ].join(" ")}
      />
      {label}
      {timeLabel && (
        <span className="text-citizen-green/50">{timeLabel}</span>
      )}
    </span>
  );
}
