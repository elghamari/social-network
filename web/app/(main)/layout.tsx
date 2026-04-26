import "../layout.css";
import Sidenav from "../ui/layout/sidenav";
import RightSidebar from "../ui/layout/right-sidebar";
import { AuthProvider } from "../context/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="app">
        <Sidenav />
        <main className="app__content">{children}</main>
        <RightSidebar />
      </div>
    </AuthProvider>
  );
}
