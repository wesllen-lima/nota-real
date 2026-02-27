"use client";

import { LayoutGroup } from "framer-motion";
import { AppContextProvider, useAppContext } from "@/context/impact-context";
import { useAmbientAura } from "@/hooks/use-ambient-aura";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";
import { ImpactHeader } from "./impact-header";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { ConsumoDrawer } from "@/components/drawers/consumo-drawer";
import { TrabalhoDrawer } from "@/components/drawers/trabalho-drawer";
import { UtilityDrawer } from "@/components/drawers/utility-drawer";

// Componente nulo — controla ambient auras via CSS custom props
function AmbientController() {
  const { totalTaxImpact } = useAppContext();
  useAmbientAura(totalTaxImpact);
  return null;
}

function AppContent() {
  const { openDrawer, setOpenDrawer } = useAppContext();

  return (
    <LayoutGroup>
      <div className="min-h-screen">
        <AppSidebar />
        <BottomNav />

        <div className="md:ml-[240px] pb-16 md:pb-0">
          <ImpactHeader />
          <main className="px-4 py-8 sm:px-6 lg:px-8">
            {/* Dashboard e sempre o hub — nunca desmonta */}
            <DashboardSection />
          </main>
        </div>

        {/* Drawers sobrepostos ao dashboard */}
        <ConsumoDrawer
          isOpen={openDrawer === "consumo"}
          onClose={() => setOpenDrawer(null)}
        />
        <TrabalhoDrawer
          isOpen={openDrawer === "trabalho"}
          onClose={() => setOpenDrawer(null)}
        />
        <UtilityDrawer
          isOpen={openDrawer === "utilidades"}
          onClose={() => setOpenDrawer(null)}
        />
      </div>
    </LayoutGroup>
  );
}

export function AppShell() {
  return (
    <AppContextProvider>
      <AmbientController />
      <AppContent />
    </AppContextProvider>
  );
}
