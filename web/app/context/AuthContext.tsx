"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../lib/services/auth";

type AuthContextType = {
  user: any | null;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await authService.getMe();
      if (res) setUser(res.user);
    } catch (err) {      
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    finally {
      setUser(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
