"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Controla a intensidade das ambient auras via CSS custom props em :root.
 * A aura Tax-Red pulsa com o total de impostos; a Citizen-Green permanece estavel.
 *
 * @param totalTaxImpact - soma de todos os impostos calculados (R$)
 */
export function useAmbientAura(totalTaxImpact: number) {
  // Normaliza: R$0 → 0.0, R$500+ → 1.0
  const normalized = Math.min(totalTaxImpact / 500, 1);

  const motionVal = useMotionValue(normalized);
  const springVal = useSpring(motionVal, { stiffness: 35, damping: 18, mass: 1 });

  useEffect(() => {
    motionVal.set(normalized);
  }, [normalized, motionVal]);

  useEffect(() => {
    const unsub = springVal.on("change", (v: number) => {
      // Tax-Red: base 8%, max 20% ao atingir R$500+
      const redIntensity = 0.08 + v * 0.12;
      document.documentElement.style.setProperty(
        "--ambient-intensity-red",
        redIntensity.toFixed(4)
      );
    });
    return unsub;
  }, [springVal]);
}
