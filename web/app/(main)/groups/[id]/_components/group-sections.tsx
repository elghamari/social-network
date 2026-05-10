"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGroupChatBadge } from "../chat/_hooks/useGroupChatBadge"; 

export default function GroupSections({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const { unreadCount } = useGroupChatBadge(Number(groupId));

  const sections = [
    { label: "Posts", href: `/groups/${groupId}/posts` },
    { label: "Events", href: `/groups/${groupId}/events` },
    { label: "Chat", href: `/groups/${groupId}/chat` },
    { label: "Manage", href: `/groups/${groupId}/manage` },
  ];

  return (
    <nav className="gd__sections">
      {sections.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`gd__section ${
            pathname === tab.href ? "gd__section--active" : ""
          }`}
          style={{ display: "flex", alignItems: "center", gap: "6px" }} 
        >
          {tab.label}
          {tab.label === "Chat" && unreadCount > 0 && (
            <span style={{
              backgroundColor: '#3b82f6', 
              color: 'white', 
              fontSize: '10px',
              minWidth: '18px', 
              height: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%', 
              fontWeight: 'bold'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}