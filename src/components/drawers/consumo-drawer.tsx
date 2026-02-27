"use client";

import { Drawer } from "@/components/ui/drawer";
import { ConsumoSection } from "@/components/sections/consumo-section";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsumoDrawer({ isOpen, onClose }: Props) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Raio-X de Consumo" description="Calcule a carga tributaria de qualquer produto">
      <ConsumoSection />
    </Drawer>
  );
}
