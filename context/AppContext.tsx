"use client";

import { useUser } from "@clerk/nextjs";
import React, { createContext, useContext, useMemo } from "react";

type AppContextType = {
  user: ReturnType<typeof useUser>["user"];
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside AppContextProvider");
  }
  return ctx;
};

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoaded, isSignedIn } = useUser();

  const value = useMemo(() => {
    return { user, isLoaded, isSignedIn };
  }, [user, isLoaded, isSignedIn]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext };
