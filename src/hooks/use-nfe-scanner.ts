"use client";

import { useState, useCallback, useRef } from "react";
import { parseNFeXml } from "@/services/nfe";
import { toast } from "@/hooks/use-toast";
import type { NFeParsed } from "@/types/nfe";

export type NfeScannerMode = "upload" | "qr";
export type NfeScannerStatus = "idle" | "loading" | "success" | "error";

export interface NfeScannerState {
  mode: NfeScannerMode;
  status: NfeScannerStatus;
  result: NFeParsed | null;
  error: string | null;
  /** URL detectada pelo QR antes de scraping */
  detectedUrl: string | null;
}

const INITIAL_STATE: NfeScannerState = {
  mode: "upload",
  status: "idle",
  result: null,
  error: null,
  detectedUrl: null,
};

export function useNfeScanner() {
  const [state, setState] = useState<NfeScannerState>(INITIAL_STATE);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleXmlUpload = useCallback((file: File) => {
    if (!file.name.endsWith(".xml")) {
      setState((s) => ({ ...s, status: "error", error: "Selecione um arquivo .xml de NF-e ou NFC-e." }));
      return;
    }

    setState((s) => ({ ...s, status: "loading", error: null, result: null }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target?.result as string;
      const parsed = parseNFeXml(xml);
      if (parsed.success) {
        setState((s) => ({ ...s, status: "success", result: parsed.data, error: null }));
      } else {
        const errorMsg = parsed.error.message.toLowerCase().includes("nao reconhecido")
          ? "Arquivo XML invalido ou nao reconhecido como Nota Fiscal."
          : `Falha ao ler XML: ${parsed.error.message}`;
        toast(errorMsg);
        setState((s) => ({
          ...s,
          status: "error",
          error: errorMsg,
          result: null,
        }));
      }
    };
    reader.onerror = () => {
      setState((s) => ({ ...s, status: "error", error: "Erro ao ler o arquivo.", result: null }));
    };
    reader.readAsText(file, "UTF-8");
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startQrScan = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;

    if (!("BarcodeDetector" in window)) {
      setState((s) => ({
        ...s,
        mode: "qr",
        status: "error",
        error: "BarcodeDetector nao suportado neste navegador. Use o Chrome ou Edge, ou faca o upload do XML.",
      }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
        detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
      };
      const BarcodeDetectorCls = (
        window as Window & { BarcodeDetector: BarcodeDetectorCtor }
      ).BarcodeDetector;
      const detector = new BarcodeDetectorCls({ formats: ["qr_code"] });

      setState((s) => ({ ...s, mode: "qr", status: "loading", error: null }));

      const scan = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length > 0) {
            const url: string = codes[0].rawValue as string;
            stopCamera();
            setState((s) => ({ ...s, detectedUrl: url, status: "loading" }));
            await scrapeNfce(url);
            return;
          }
        } catch { /* continua scanneando */ }
        rafRef.current = requestAnimationFrame(() => { scan(); });
      };

      rafRef.current = requestAnimationFrame(() => { scan(); });
    } catch {
      setState((s) => ({
        ...s,
        mode: "qr",
        status: "error",
        error: "Permissao de camera negada. Faca o upload do XML como alternativa.",
      }));
    }
  }, [stopCamera]); // eslint-disable-line react-hooks/exhaustive-deps

  async function scrapeNfce(url: string) {
    try {
      const res = await fetch("/api/nfe/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setState((s) => ({
          ...s,
          status: "error",
          error: err.error ?? `Erro do servidor: ${res.status}`,
        }));
        return;
      }

      const data = await res.json() as NFeParsed;
      setState((s) => ({ ...s, status: "success", result: data, error: null }));
    } catch {
      setState((s) => ({
        ...s,
        status: "error",
        error: "Falha de rede ao consultar a SEFAZ. Tente o upload do XML.",
      }));
    }
  }

  const setMode = useCallback((mode: NfeScannerMode) => {
    stopCamera();
    setState({ ...INITIAL_STATE, mode });
  }, [stopCamera]);

  const reset = useCallback(() => {
    stopCamera();
    setState(INITIAL_STATE);
  }, [stopCamera]);

  return {
    state,
    setMode,
    reset,
    handleXmlUpload,
    startQrScan,
    stopCamera,
  };
}
