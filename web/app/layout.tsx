import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./ui/globals.css";
import "./ui/layout/layout.css";
import Sidenav from "./ui/layout/sidenav";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus - Social Network",
  description: "Connect with your network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={josefin.variable}>
      <body>
        <div className="app">
          <Sidenav />
          <main className="app__content">{children}</main>
        </div>
      </body>
    </html>
  );
}
