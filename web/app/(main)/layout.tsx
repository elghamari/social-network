import { AuthProvider } from "../context/AuthContext";
import "../layout.css";
import NavBar from "../ui/layout/navbar";
import Sidenav from "../ui/layout/sidenav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider> 
      <NavBar/>
    <div className="app">
      <Sidenav />
      <main className="app__content">{children}</main>
    </div>
      </AuthProvider> 
  );
}
