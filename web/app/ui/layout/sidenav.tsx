"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "@/app/lib/types/layout";
import { AppIcon } from "../icons";
import "./sidenav.css";
import { useAuth } from "@/app/_context/AuthContext";
import SearchModal from "./SearchModal";

const navItems: NavItem[] = [
  {
    id: "feed",
    label: "Feed",
    href: "/",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  },
  {
    id: "search",
    label: "Search",
    href: "#",
    icon: "M21 21l-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  },
  {
    id: "groups",
    label: "Groups",
    href: "/groups",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/chat",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  },
];

export default function Sidenav() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href) && href !== "#";
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      router.push("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";

  return (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <aside className="sidenav">
        <div className="sidenav__header">
          <Link href="/" className="sidenav__logo">
            <div className="sidenav__logo-icon">
              <AppIcon />
            </div>
            <span className="sidenav__logo-text">Nexus</span>
          </Link>
        </div>

        <nav className="sidenav__nav">
          <ul className="sidenav__list">
            {navItems.map((item) => {
              if (item.id === "search") {
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="sidenav__link"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        padding: "12px 16px",
                      }}
                    >
                      <span className="sidenav__icon">
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={item.icon} />
                        </svg>
                      </span>
                      <span className="sidenav__label">{item.label}</span>
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`sidenav__link ${isActive(item.href) ? "sidenav__link--active" : ""}`}
                  >
                    <span className="sidenav__icon">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={item.icon} />
                      </svg>
                    </span>
                    <span className="sidenav__label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidenav__footer">
          <div className="sidenav__divider" />

          <Link href="/profile">
            <div className="sidenav__user">
              <div className="sidenav__avatar" style={{ overflow: "hidden" }}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span>
                    {firstName[0] ?? ""}
                    {lastName[0] ?? ""}
                  </span>
                )}
              </div>
              <div className="sidenav__user-info">
                <span className="sidenav__user-name">
                  {firstName} {lastName}
                </span>
                <span className="sidenav__user-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="sidenav__logout"
            style={{
              background: "transparent",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}