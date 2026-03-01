"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded p-0.5 text-white/20 transition-colors hover:text-white/55"
      title="Copiar"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}
