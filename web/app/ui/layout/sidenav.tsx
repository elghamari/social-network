"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/app/lib/types/layout";
import { AppIcon } from "../icons";
import "./sidenav.css";
import { useAuth } from "@/app/_context/AuthContext";
import { useNotifications } from "@/app/_context/NotificationContext";
import { useWebSocket } from "@/app/_context/WebSocketContext";
import NotificationPanel from "./notification-panel";

const navItems: NavItem[] = [
  { id: "feed", label: "Feed", href: "/", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { id: "search", label: "Search", href: "/search", icon: "M21 21l-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" },
  { id: "groups", label: "Groups", href: "/groups", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" },
  { id: "messages", label: "Messages", href: "/chat", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { id: "notifications", label: "Notifications", href: "#", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
];

export default function Sidenav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { socket } = useWebSocket();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handleWsMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "new_private_message" && !pathname.startsWith("/chat")) {
          setUnreadMessagesCount(prev => prev + 1);
        }
      } catch (error) { console.error("WS error in Sidenav:", error); }
    };
    socket.addEventListener("message", handleWsMessage);
    return () => socket.removeEventListener("message", handleWsMessage);
  }, [socket, pathname]);

  useEffect(() => {
    if (pathname.startsWith("/chat")) setUnreadMessagesCount(0);
  }, [pathname]);

  const isActive = (href: string) => {
    if (isNotifOpen) return false; 
    if (href === "/") return pathname === href;
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  const { user } = useAuth();
  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";

  return (
    <aside className="sidenav">
      <div className="sidenav__header">
        <Link href="/" className="sidenav__logo">
          <div className="sidenav__logo-icon"><AppIcon /></div>
          <span className="sidenav__logo-text">Nexus</span>
        </Link>
      </div>

      <nav className="sidenav__nav">
        <ul className="sidenav__list">
          {navItems.map((item) => {
            if (item.id === "notifications") {
              return (
                <li key={item.id} style={{ position: "relative" }}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`sidenav__link ${isNotifOpen ? "sidenav__link--active" : ""}`}
                    style={{
                      width: "100%", background: "none", border: "none",
                      textAlign: "left", cursor: "pointer", display: 'flex', alignItems: 'center'
                    }}
                  >
                    <span className="sidenav__icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </span>
                    <span className="sidenav__label">{item.label}</span>
                    {unreadCount > 0 && (
                      <span className="badge-notification" style={{
                        backgroundColor: '#ef4444', color: 'white', fontSize: '10px',
                        minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', marginLeft: 'auto'
                      }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </button>
                  <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`sidenav__link ${isActive(item.href) ? "sidenav__link--active" : ""}`}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <span className="sidenav__icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </span>
                  <span className="sidenav__label">{item.label}</span>
                  {item.id === "messages" && unreadMessagesCount > 0 && (
                    <span className="badge-message" style={{
                      backgroundColor: '#3b82f6', color: 'white', fontSize: '10px',
                      minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', marginLeft: 'auto'
                    }}>{unreadMessagesCount}</span>
                  )}
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
            <div className="sidenav__avatar">
              <span>{firstName[0] ?? ""}{lastName[0] ?? ""}</span>
            </div>
            <div className="sidenav__user-info">
              <span className="sidenav__user-name">{firstName} {lastName}</span>
              <span className="sidenav__user-status"><span className="status-dot"></span>Online</span>
            </div>
          </div>
        </Link>
        <Link href="/login" className="sidenav__logout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}