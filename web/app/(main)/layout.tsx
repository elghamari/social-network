import "../layout.css";
import Sidenav from "../ui/layout/sidenav";
<<<<<<< HEAD
=======
import RightSidebar from "../ui/layout/right-sidebar";
import { AuthProvider } from "../context/AuthContext";
import NavBar from "../ui/layout/navbar";
>>>>>>> origin/feed

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <div className="app">
      <Sidenav />
      <main className="app__content">{children}</main>
    </div>
=======
    <AuthProvider>
      <NavBar/>
      <div className="app">
        <Sidenav />
        <main className="app__content">{children}</main>
        <RightSidebar />
      </div>
    </AuthProvider>
>>>>>>> origin/feed
  );
}
