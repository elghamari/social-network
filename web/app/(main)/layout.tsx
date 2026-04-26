"use client";

import { usePathname } from "next/navigation";
import "../layout.css";
import Sidenav from "../ui/layout/sidenav";
import RightSidebar from "../ui/layout/right-sidebar";
import { AuthProvider } from "../context/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname === '/chat' || pathname.startsWith('/chat/');

  return (
    <AuthProvider>
      <div className="app">
        <Sidenav />
        <main className="app__content">{children}</main>
        {!isChatPage && <RightSidebar />}
      </div>
    </AuthProvider>
  );
}