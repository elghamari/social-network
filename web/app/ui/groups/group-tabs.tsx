"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GroupTabs({
  groupId,
  isMember,
  isCreator,
}: {
  groupId: string;
  isMember: boolean;
  isCreator: boolean;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: "Posts", href: `/groups/${groupId}/posts` },
    { label: "Events", href: `/groups/${groupId}/events` },
  ];

  if (isMember) {
    tabs.push({ label: "Chat", href: `/groups/${groupId}/chat` });
    tabs.push({
      label: isCreator ? "Manage" : "Invite",
      href: `/groups/${groupId}/manage`,
    });
  }

  return (
    <nav className="gd__tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`gd__tab ${
            pathname === tab.href ? "gd__tab--active" : ""
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
