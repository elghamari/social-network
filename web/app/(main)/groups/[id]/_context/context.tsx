"use client";

import type { Group, GroupRole } from "@/app/lib/types/group";
import { createContext, useContext } from "react";

type GroupContextValue = {
  group: Group;
  updateGroup: (updater: (prev: Group) => Group) => void;
};

const Context = createContext<GroupContextValue | null>(null);

type GroupProviderProps = {
  group: Group;
  updateGroup: (updater: (prev: Group) => Group) => void;
  children: React.ReactNode;
};

export default function GroupProvider({
  group,
  updateGroup,
  children,
}: GroupProviderProps) {
  return (
    <Context.Provider value={{ group, updateGroup }}>
      {children}
    </Context.Provider>
  );
}

export function useGroupContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useGroupContext must be used inside GroupProvider");
  }

  return context;
}
