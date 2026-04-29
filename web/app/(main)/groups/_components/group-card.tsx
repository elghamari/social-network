"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cancelJoinRequest, submitJoinRequest } from "@/app/lib/services/group";

import { Group } from "@/app/lib/types/group";

type Props = {
  group: Group;
  onRequest: (gid: string) => void;
};

export default function GroupCard({ group, onRequest }: Props) {
  const isMember = group.role === "CREATOR" || group.role === "MEMBER";
  const isPending = group.role === "PENDING";

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const action = isPending ? cancelJoinRequest : submitJoinRequest;

    setLoading(true);
    const resp = await action(group.id);
    setLoading(false);

    if (!resp) return;

    onRequest(group.id);
  };

  return (
    <div
      className="group-card"
      onClick={() => {
        router.push(`/groups/${group.id}`);
      }}
    >
      <div className="group-card__cover">
        {group.coverPath && <img src={group.coverPath} alt="" />}
      </div>

      <div className="group-card__content">
        <h3 className="group-card__title">{group.title}</h3>
        <p className="group-card__description">{group.description}</p>

        <div className="group-card__footer">
          <span className="group-card__members">
            {group.memberCount} members
          </span>

          {isMember ? (
            <span className="group-card__badge group-card__badge--member">
              Joined
            </span>
          ) : (
            <button
              className={
                isPending
                  ? "group-card__badge group-card__badge--pending"
                  : "group-card__badge group-card__badge--request"
              }
              onClick={handleRequest}
              disabled={loading}
            >
              {loading ? "..." : isPending ? "Pending" : "Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
