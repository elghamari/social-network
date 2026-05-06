import Sidenav from "@/app/ui/layout/sidenav";
import { AuthProvider } from "@/app/_context/AuthContext";
import "./layout.css";
import { WebSocketProvider } from "../_context/WebSocketContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className="app">
          <Sidenav />
          <main className="app__content">{children}</main>
        </div>
      </WebSocketProvider>
    </AuthProvider>
  );
}
