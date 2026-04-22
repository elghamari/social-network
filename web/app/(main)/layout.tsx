import "../layout.css";
import Sidenav from "../ui/layout/sidenav";
import RightSidebar from "../ui/layout/right-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <Sidenav />
      <main className="app__content">{children}</main>
      <RightSidebar />
    </div>
  );
}
