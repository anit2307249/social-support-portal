import React from "react";
import Background from "./Background";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
