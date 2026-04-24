"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/app/lib/services/auth";
import { log } from "node:console";

type AuthContextType = {
  user: any | null;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  const fetchUser = async () => {
    try {
      const res = await authService.getMe();
      console.log(res);
      
      if (res.status === 200) setUser(res.user);
    } catch (err) {
      console.log("err468888888888888888888",err);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};