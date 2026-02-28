"use client";

import { LayoutGroup } from "framer-motion";
import { AppContextProvider, useAppContext } from "@/context/impact-context";
import { AppSidebar } from "./app-sidebar";
import { ToastContainer } from "@/components/ui/toast-container";
import { BottomNav } from "./bottom-nav";
import { ImpactHeader } from "./impact-header";
import { TaxGlossarySidebar } from "./tax-glossary-sidebar";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { OnboardingModal } from "./onboarding-modal";
import { ConsumoDrawer } from "@/components/drawers/consumo-drawer";
import { TrabalhoDrawer } from "@/components/drawers/trabalho-drawer";
import { UtilityDrawer } from "@/components/drawers/utility-drawer";

function AppContent() {
  const { openDrawer, setOpenDrawer, glossaryOpen } = useAppContext();

  return (
    <LayoutGroup>
      <div className="min-h-screen">
        <AppSidebar />
        <TaxGlossarySidebar />
        <BottomNav />

        {/* Coluna central — sidebar esq (240) + glossario dir (320, condicional) */}
        <div className={`pb-16 md:ml-[240px] md:pb-0 ${glossaryOpen ? "md:mr-[320px]" : "md:mr-0"}`}>
          {/* ImpactHeader so aparece quando um Drawer esta aberto */}
          {openDrawer !== null && <ImpactHeader />}
          <main className="px-5 py-5 sm:px-8">
            {/* Dashboard e sempre o hub — nunca desmonta */}
            <DashboardSection />
          </main>
        </div>

        {/* Intercept de onboarding — bloqueia ate o usuario informar a renda */}
        <OnboardingModal />

        {/* Toast notifications */}
        <ToastContainer />

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
      <AppContent />
    </AppContextProvider>
  );
}
