"use client";

import { Drawer } from "@/components/ui/drawer";
import { UtilitySection } from "@/components/sections/utilidades-section";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UtilityDrawer({ isOpen, onClose }: Props) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Scanner de Contas" description="ICMS em cascata, COSIP e rastro social">
      <UtilitySection />
    </Drawer>
  );
}
