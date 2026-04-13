// app/ui/groups/GroupCard.tsx
"use client";

import Link from "next/link";
import { Group } from "@/app/lib/types/groups";

interface GroupCardProps {
  group: Group;
  onRequestJoin?: (groupId: string) => void;
}

export default function GroupCard({ group, onRequestJoin }: GroupCardProps) {
  const handleRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    onRequestJoin?.(group.id);
  };

  return (
    <Link href={`/groups/${group.id}`} className="group-card">
      <div className="group-card__cover">
        {group.coverImage && <img src={group.coverImage} alt="" />}
      </div>

      <div className="group-card__content">
        <h3 className="group-card__title">{group.title}</h3>
        <p className="group-card__description">{group.description}</p>

        <div className="group-card__footer">
          <span className="group-card__members">
            {group.memberCount} members
          </span>

          {group.isJoined ? (
            <span className="group-card__action group-card__action--member">
              Joined
            </span>
          ) : group.isPending ? (
            <span className="group-card__action group-card__action--pending">
              Pending
            </span>
          ) : (
            <button
              className="group-card__action group-card__action--request"
              onClick={handleRequest}
            >
              Request
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
