"use client";
import "../layout.css";
import Sidenav from "@/app/ui/layout/sidenav";
import RightSidebar from "@/app/ui/layout/right-sidebar";
import { AuthProvider } from "@/app/_context/AuthContext";
import { WebSocketProvider } from "../_context/WebSocketContext";
import { usePathname } from "next/navigation";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat"); 

  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className="app">
          <Sidenav />
          <main className="app__content">{children}</main>
          {!isChatPage && <RightSidebar />}
        </div>
      </WebSocketProvider>
    </AuthProvider>
  );
}
