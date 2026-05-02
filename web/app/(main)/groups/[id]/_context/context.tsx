import type { Group } from "@/app/lib/types/group";
import { createContext, useContext } from "react";

const Context = createContext<Group | null>(null);

type GroupContextProps = {
  group: Group;
  children: React.ReactNode;
};

export default function GroupProvider({ group, children }: GroupContextProps) {
  return <Context.Provider value={group}>{children}</Context.Provider>;
}

export function useGroupContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useGroupContext must be used inside GroupProvider");
  }

  return context;
}
