"use client";

import { AppContextProvider, useAppContext } from "@/context/impact-context";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";
import { ImpactHeader } from "./impact-header";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { ConsumoSection } from "@/components/sections/consumo-section";
import { TrabalhoSection } from "@/components/sections/trabalho-section";
import { UtilitySection } from "@/components/sections/utilidades-section";

function AppContent() {
  const { activeSection } = useAppContext();

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <BottomNav />

      <div className="md:ml-[240px] pb-16 md:pb-0">
        <ImpactHeader />

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          {activeSection === "dashboard" && <DashboardSection />}
          {activeSection === "consumo" && <ConsumoSection />}
          {activeSection === "trabalho" && <TrabalhoSection />}
          {activeSection === "utilidades" && <UtilitySection />}
        </main>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}
