"use client";

import { SessionProvider } from "next-auth/react";
import { LogoProvider } from "@/contexts/LogoContext";

interface ProvidersProps {
  children: React.ReactNode;
  logo?: { logoHero?: string; logoScrolled?: string };
}

export function Providers({ children, logo }: ProvidersProps) {
  return (
    <SessionProvider basePath="/api/auth">
      <LogoProvider value={logo ?? {}}>
        {children}
      </LogoProvider>
    </SessionProvider>
  );
}
