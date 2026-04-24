"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sections({
  groupId,
  isMember,
  isCreator,
}: {
  groupId: string;
  isMember: boolean;
  isCreator: boolean;
}) {
  const pathname = usePathname();

  const sections = [
    { label: "Posts", href: `/groups/${groupId}/posts` },
    { label: "Events", href: `/groups/${groupId}/events` },
  ];

  if (isMember)
    sections.push({ label: "Chat", href: `/groups/${groupId}/chat` });

  if (isCreator)
    sections.push({ label: "Manage", href: `/groups/${groupId}/manage` });

  return (
    <nav className="gd__sections">
      {sections.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`gd__section ${
            pathname === tab.href ? "gd__section--active" : ""
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
