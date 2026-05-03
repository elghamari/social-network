"use client";

import { useState } from "react";
import { Group } from "@/app/lib/types/groups";
import {
  createJoinRequest,
  deleteJoinRequest,
} from "@/app/lib/services/groups";
import { useRouter } from "next/navigation";

export default function GroupCard({ group }: { group: Group }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) {
      deleteJoinRequest(group.id);
      setIsPending(false);
    } else {
      createJoinRequest(group.id);
      setIsPending(true);
    }
  };

  return (
    <div
      className="group-card"
      onClick={() => {
        router.push(`/groups/${group.id}`);
      }}
    >
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
          ) : (
            <button
              className={`group-card__action ${
                isPending
                  ? "group-card__action--pending"
                  : "group-card__action--request"
              }`}
              onClick={handleRequest}
            >
              {isPending ? "Pending" : "Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
