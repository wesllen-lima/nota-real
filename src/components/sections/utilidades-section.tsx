"use client";

import { useAppContext } from "@/context/impact-context";
import { UtilityScanner } from "@/components/utility/utility-scanner";
import type { UtilityTaxResult } from "@/types/utility";

export function UtilitySection() {
  const { setUtilityResult } = useAppContext();

  function handleResult(r: UtilityTaxResult) {
    setUtilityResult(r);
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <UtilityScanner onResult={handleResult} />
    </div>
  );
}
