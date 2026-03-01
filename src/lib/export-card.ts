import { toPng } from "html-to-image";
import { BRL } from "@/lib/utils";

export interface ShareImpactData {
  totalTaxAmount: number;
  taxRate?: number | null;
  laborWorkHours?: number | null;
  context?: "dashboard" | "consumo";
}

export async function shareImpact(data: ShareImpactData): Promise<"shared" | "copied"> {
  const text = buildShareText(data);

  if (typeof navigator !== "undefined" && "share" in navigator) {
    await navigator.share({ text });
    return "shared";
  }

  if (typeof navigator !== "undefined") {
    await (navigator as Navigator).clipboard.writeText(text);
  }
  return "copied";
}

export async function exportFunnelImage(node: HTMLElement): Promise<void> {
  const dataUrl = await toPng(node, {
    backgroundColor: "#09090b",
    pixelRatio: 2,
  });

  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], "extrato-nota-real.png", { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    navigator.canShare?.({ files: [file] })
  ) {
    await navigator.share({ files: [file], title: "Extrato Nota Real" });
    return;
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "extrato-nota-real.png";
  link.click();
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
