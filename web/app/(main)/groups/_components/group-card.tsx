"use client";

import { useRouter } from "next/navigation";

import JoinButton from "./join-button";

import { Group } from "@/app/lib/types/group";

export default function GroupCard({ group }: { group: Group }) {
  const isMember = group.role === "CREATOR" || group.role === "MEMBER";

  const router = useRouter();

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
            <JoinButton groupId={group.id} groupRole={group.role} type="card" />
          )}
        </div>
      </div>
    </div>
  );
}
