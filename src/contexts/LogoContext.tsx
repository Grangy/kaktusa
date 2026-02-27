"use client";

import { createContext, useContext } from "react";

export interface LogoContextValue {
  logoHero: string;
  logoScrolled: string;
}

const defaults: LogoContextValue = {
  logoHero: "/new-logo.png",
  logoScrolled: "/logo.png",
};

const LogoContext = createContext<LogoContextValue>(defaults);

export function LogoProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: Partial<LogoContextValue>;
}) {
  const merged = { ...defaults, ...value };
  return (
    <LogoContext.Provider value={merged}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo(): LogoContextValue {
  return useContext(LogoContext);
}
