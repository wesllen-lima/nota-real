"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  QrCode,
  Store,
  CalendarDays,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useNfeScanner } from "@/hooks/use-nfe-scanner";
import type { NFeParsed } from "@/types/nfe";
import { BRL, PCT } from "@/lib/utils";

function NfeResult({ data }: { data: NFeParsed }) {
  const { totais, emitente, itens, dataEmissao } = data;
  const totalTax = totais.vTotTrib ?? (totais.vICMS + totais.vPIS + totais.vCOFINS + (totais.vIPI ?? 0));
  const taxRate = totais.vNF > 0 ? totalTax / totais.vNF : 0;

  const dataFormatada = dataEmissao
    ? new Date(dataEmissao).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      {/* Metadados do emitente */}
      <div className="card-glass rounded-2xl p-5">
        <div className="mb-4 flex items-start gap-3">
          <Store size={14} className="mt-0.5 shrink-0 text-gov-blue/60" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white/80 truncate">{emitente.xNome}</p>
            {emitente.xFant && (
              <p className="text-[11px] text-white/40">{emitente.xFant}</p>
            )}
            <p className="mt-0.5 font-mono text-[10px] text-white/25">
              CNPJ {emitente.CNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
              {" · "}
              {emitente.xMun}/{emitente.UF}
            </p>
          </div>
          {dataEmissao && (
            <div className="ml-auto flex items-center gap-1 text-white/30 shrink-0">
              <CalendarDays size={11} />
              <span className="text-[10px]">{dataFormatada}</span>
            </div>
          )}
        </div>

        {/* Totais */}
        <div
          className="grid grid-cols-3 gap-3 rounded-xl px-4 py-3"
          style={{ background: "oklch(0.14 0 0 / 60%)", border: "1px solid oklch(1 0 0 / 5%)" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">Total pago</span>
            <span className="font-mono text-[13px] font-bold tracking-tighter text-white/70">
              {BRL(totais.vNF)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">Impostos</span>
            <span className="font-mono text-[13px] font-bold tracking-tighter text-tax-red">
              {BRL(totalTax)}
            </span>
            <span className="font-mono text-[10px] text-white/25">{PCT(taxRate)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">Valor real</span>
            <span className="font-mono text-[13px] font-bold tracking-tighter text-citizen-green">
              {BRL(totais.vNF - totalTax)}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown de tributos */}
      <div className="card-glass rounded-2xl p-5">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
          Tributos — ICMSTot
        </p>
        <div className="flex flex-col divide-y divide-white/[0.04]">
          {[
            { label: "ICMS", value: totais.vICMS, color: "#EF4444" },
            { label: "PIS", value: totais.vPIS, color: "#F97316" },
            { label: "COFINS", value: totais.vCOFINS, color: "#F97316" },
            ...(totais.vIPI ? [{ label: "IPI", value: totais.vIPI, color: "#A855F7" }] : []),
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-[12px] text-white/60">{label}</span>
              <span className="font-mono text-[12px] font-bold tabular-nums" style={{ color }}>
                {BRL(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Itens */}
      {itens.length > 0 && (
        <div className="card-glass rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <Package size={12} className="text-white/30" />
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
              Itens ({itens.length})
            </p>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.03]">
            {itens.slice(0, 8).map((item) => {
              const itemTax =
                (item.imposto.vICMS ?? 0) +
                (item.imposto.vPIS ?? 0) +
                (item.imposto.vCOFINS ?? 0) +
                (item.imposto.vIPI ?? 0);
              return (
                <div key={item.nItem} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-white/65">{item.xProd}</p>
                    <p className="font-mono text-[10px] text-white/25">
                      {item.qCom} {item.uCom} × {BRL(item.vUnCom)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[12px] font-semibold text-white/60">
                      {BRL(item.vProd)}
                    </p>
                    {itemTax > 0 && (
                      <p className="font-mono text-[10px] text-tax-red/70">
                        {BRL(itemTax)} imp.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {itens.length > 8 && (
              <p className="pt-2 text-[10px] text-white/25">
                + {itens.length - 8} item(ns) adicionais
              </p>
            )}
          </div>
        </div>
      )}

      <div
        className="rounded-xl px-3 py-2 text-[10px] leading-relaxed text-white/35"
        style={{ background: "#10B98108", border: "1px solid #10B98115" }}
      >
        Dados extraidos diretamente do XML oficial da SEFAZ. Nenhum valor foi inventado.
      </div>
    </motion.div>
  );
}

function XmlUploadPanel({
  onFile,
  status,
}: {
  onFile: (f: File) => void;
  status: "idle" | "loading" | "success" | "error";
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-white/20 hover:bg-white/[0.03]"
    >
      <input
        ref={fileRef}
        type="file"
        accept=".xml"
        className="hidden"
        onChange={handleChange}
      />
      {status === "loading" ? (
        <Loader2 size={24} className="animate-spin text-gov-blue/60" />
      ) : (
        <Upload size={24} className="text-white/25" />
      )}
      <div>
        <p className="text-[13px] font-medium text-white/60">
          {status === "loading" ? "Analisando XML..." : "Solte o XML aqui ou clique para selecionar"}
        </p>
        <p className="mt-1 text-[11px] text-white/30">
          Aceita arquivos .xml de NF-e (modelo 55) e NFC-e (modelo 65)
        </p>
        <p className="mt-2 text-[10px] text-white/20">
          O arquivo e processado localmente — nenhum dado e enviado a servidores.
        </p>
      </div>
    </div>
  );
}

function QrScannerPanel({
  onStartScan,
  onStopScan,
  status,
  error,
  detectedUrl,
}: {
  onStartScan: (v: HTMLVideoElement) => void;
  onStopScan: () => void;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  detectedUrl: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanning = status === "loading" && !detectedUrl;

  useEffect(() => {
    return () => { onStopScan(); };
  }, [onStopScan]);

  function handleStart() {
    if (videoRef.current) onStartScan(videoRef.current);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview da câmera */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-white/[0.02]">
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full rounded-2xl object-cover"
          style={{ maxHeight: 280, display: scanning ? "block" : "none" }}
        />
        {!scanning && (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <QrCode size={36} className="text-white/20" />
            <p className="text-[13px] font-medium text-white/50">
              Aponte a camera para o QR Code da NFC-e
            </p>
            <p className="text-[11px] text-white/30">
              A URL publica da SEFAZ sera extraida automaticamente.
              Funciona com NFC-e (modelo 65) que possuem QR Code impresso.
            </p>
          </div>
        )}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-48 w-48 rounded-xl border-2"
              style={{ border: "2px solid #10B98160" }}
            />
          </div>
        )}
      </div>

      {detectedUrl && (
        <div className="w-full rounded-xl bg-gov-blue/5 border border-gov-blue/15 px-3 py-2">
          <p className="text-[10px] text-white/40 mb-1">URL detectada — consultando SEFAZ...</p>
          <p className="font-mono text-[10px] text-white/60 break-all truncate">{detectedUrl}</p>
          <Loader2 size={12} className="mt-1 animate-spin text-gov-blue/50" />
        </div>
      )}

      {!scanning && status !== "success" && (
        <button
          type="button"
          onClick={handleStart}
          className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-3 text-[13px] font-medium text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/[0.09] hover:text-white/90"
        >
          <Camera size={14} />
          Iniciar Camera
        </button>
      )}

      {scanning && (
        <button
          type="button"
          onClick={onStopScan}
          className="text-[11px] text-white/30 underline transition-colors hover:text-white/50"
        >
          Cancelar
        </button>
      )}

      {error && !detectedUrl && (
        <div className="flex w-full items-start gap-2 rounded-xl border border-tax-red/20 bg-tax-red/5 px-3 py-2.5">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-tax-red/70" />
          <p className="text-[11px] leading-relaxed text-white/50">{error}</p>
        </div>
      )}
    </div>
  );
}

export function NfeScanner({ onSuccess }: { onSuccess?: (data: NFeParsed) => void }) {
  const { state, setMode, reset, handleXmlUpload, startQrScan, stopCamera } = useNfeScanner();
  const { mode, status, result, error, detectedUrl } = state;

  useEffect(() => {
    if (status === "success" && result && onSuccess) {
      onSuccess(result);
    }
  // onSuccess é estável (useCallback no caller) — omitir da dep é intencional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result]);

  const tabs = [
    { id: "upload" as const, label: "Upload XML", Icon: FileText },
    { id: "qr" as const, label: "Escanear QR", Icon: QrCode },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Tabs de modo */}
      <div className="flex gap-2">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={[
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-medium transition-all duration-150",
              mode === id
                ? "border border-gov-blue/30 bg-gov-blue/10 text-gov-blue"
                : "border border-white/6 bg-white/3 text-white/35 hover:bg-white/6 hover:text-white/55",
            ].join(" ")}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
        {status !== "idle" && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-[11px] text-white/25 underline transition-colors hover:text-white/45"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Status badges */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            key="badge-ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 size={14} style={{ color: "#10B981" }} />
            <span className="text-[12px] text-citizen-green">
              {mode === "upload" ? "XML lido com sucesso" : "NFC-e consultada com sucesso"}
            </span>
          </motion.div>
        )}
        {status === "error" && mode === "upload" && (
          <motion.div
            key="badge-err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <XCircle size={14} style={{ color: "#EF4444" }} />
            <span className="text-[12px] text-tax-red/80">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel ativo */}
      <AnimatePresence mode="wait">
        {mode === "upload" && status !== "success" ? (
          <motion.div
            key="upload-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <XmlUploadPanel onFile={handleXmlUpload} status={status} />
          </motion.div>
        ) : mode === "qr" && status !== "success" ? (
          <motion.div
            key="qr-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QrScannerPanel
              onStartScan={startQrScan}
              onStopScan={stopCamera}
              status={status}
              error={error}
              detectedUrl={detectedUrl}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Resultado real */}
      <AnimatePresence>
        {status === "success" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <NfeResult data={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
