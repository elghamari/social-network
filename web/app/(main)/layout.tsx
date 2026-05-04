import "../layout.css";
import Sidenav from "@/app/ui/layout/sidenav";
import RightSidebar from "@/app/ui/layout/right-sidebar";
import { AuthProvider } from "@/app/_context/AuthContext";
import NavBar from "../ui/layout/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NavBar />
      <div className="app">
        <Sidenav />
        <main className="app__content">{children}</main>
        <RightSidebar />
      </div>
    </AuthProvider>
  );
}
