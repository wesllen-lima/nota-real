import type { RefObject } from "react";

/**
 * Exporta o "Card de Indignacao" como PNG de alta resolucao.
 * Usa html-to-image (import dinamico — client-only, nao roda em SSR).
 * O elemento referenciado deve ter background solido (sem backdrop-filter).
 */
export async function exportIndignacaoCard(
  ref: RefObject<HTMLDivElement | null>
): Promise<void> {
  if (!ref.current) return;

  // Import dinamico para evitar erro em Server Components
  const { toPng } = await import("html-to-image");

  const dataUrl = await toPng(ref.current, {
    backgroundColor: "#09090b",
    pixelRatio: 3,
    quality: 1,
  });

  const a = document.createElement("a");
  a.download = `nota-real-${Date.now()}.png`;
  a.href = dataUrl;
  a.click();
}
