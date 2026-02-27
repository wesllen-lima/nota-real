"use client";

import { Drawer } from "@/components/ui/drawer";
import { TrabalhoSection } from "@/components/sections/trabalho-section";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TrabalhoDrawer({ isOpen, onClose }: Props) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Raio-X da Renda" description="IRPF, INSS e encargos patronais invisíveis">
      <TrabalhoSection />
    </Drawer>
  );
}
