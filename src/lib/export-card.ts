const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export interface ShareImpactData {
  totalTaxAmount: number;
  taxRate?: number | null;
  laborWorkHours?: number | null;
  context?: "dashboard" | "consumo";
}

/**
 * Compartilha o impacto fiscal via Web Share API (mobile-native).
 * Fallback: copia o texto para o clipboard.
 * Retorna "shared" | "copied" para feedback no toast.
 */
export async function shareImpact(data: ShareImpactData): Promise<"shared" | "copied"> {
  const text = buildShareText(data);

  if (typeof navigator !== "undefined" && "share" in navigator) {
    await navigator.share({ text });
    return "shared";
  }

  await navigator.clipboard.writeText(text);
  return "copied";
}

function buildShareText({
  totalTaxAmount,
  taxRate,
  laborWorkHours,
  context,
}: ShareImpactData): string {
  const lines: string[] = [];

  if (context === "consumo") {
    if (taxRate) {
      lines.push(`${(taxRate * 100).toFixed(1)}% de impostos ocultos nessa compra.`);
    }
    lines.push(`${BRL(totalTaxAmount)} pagos ao Estado sem aparecer na nota.`);
  } else {
    lines.push(`Meu sócio oculto leva ${BRL(totalTaxAmount)}/mês.`);
    if (taxRate) {
      lines.push(`${(taxRate * 100).toFixed(1)}% da minha renda vai para o Estado.`);
    }
    if (laborWorkHours) {
      lines.push(`${laborWorkHours.toFixed(0)}h de trabalho/mês só de impostos.`);
    }
  }

  lines.push("");
  lines.push("Calcule o seu: nota-real.app");
  lines.push("#NotaReal #TransparenciaFiscal");

  return lines.join("\n");
}
