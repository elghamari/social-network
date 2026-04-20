"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Group } from "@/app/lib/types/groups";
import { showToast } from "@/app/ui/layout/toast-store";
import { BASE_URL } from "@/app/lib/services/client";
import {
  createJoinRequest,
  deleteJoinRequest,
} from "@/app/lib/services/groups";

export default function GroupCard({ group }: { group: Group }) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [isPending, setIsPending] = useState(group.isPending);

  const handleRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const action = isPending ? deleteJoinRequest : createJoinRequest;
      const result = await action(group.id);

      if (!result.success) {
        showToast(result.error ?? "Something went wrong.");
      } else {
        setIsPending(!isPending);
      }
    });
  };

  return (
    <div
      className="group-card"
      onClick={() => {
        router.push(`/groups/${group.id}`);
      }}
    >
      <div className="group-card__cover">
        {group.coverPath && <img src={BASE_URL + group.coverPath} alt="" />}
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
              disabled={isLoading}
            >
              {isLoading ? "..." : isPending ? "Pending" : "Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
