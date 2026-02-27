import { AppShell } from "@/components/shell/app-shell";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient Auras */}
      <div className="ambient-top-right pointer-events-none fixed inset-0 z-0" />
      <div className="ambient-bottom-left pointer-events-none fixed inset-0 z-0" />

      {/* Noise texture */}
      <div className="noise pointer-events-none fixed inset-0 z-10 opacity-[0.02]" />

      <div className="relative z-20">
        <AppShell />
      </div>
    </div>
  );
}
