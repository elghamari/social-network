"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "../lib/services/auth";
import { UserProfile, GetMeResponse } from "@/app/lib/types/auth";

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res: GetMeResponse = await authService.getMe();

      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        if (pathname !== "/login" && pathname !== "/register") {
          router.replace("/login");
        }
      }
    } catch (err) {
      setUser(null);
      if (pathname !== "/login" && pathname !== "/register") {
        router.replace("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      setUser(null);
      router.replace("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); 

  return (
    <AuthContext.Provider value={{ user, isLoading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
