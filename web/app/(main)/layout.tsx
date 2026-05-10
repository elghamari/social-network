"use client";
import "./layout.css";
import Sidenav from "@/app/ui/layout/sidenav";
import { AuthProvider } from "@/app/_context/AuthContext";
import { WebSocketProvider } from "../_context/WebSocketContext";
import { NotificationProvider } from "../_context/NotificationContext";



export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationProvider>
        <div className="app">
          <Sidenav />
          <main className="app__content">{children}</main>
        </div>
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
