"use client";

import { useRouter } from "next/navigation";

import { Group } from "@/app/lib/types/group";
import GroupActions from "./group-actions";

type Props = {
  group: Group;
  onRoleChange: (gid: string) => void;
};

export default function GroupCard({ group, onRoleChange }: Props) {
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

          <GroupActions
            type={"card"}
            id={group.id}
            role={group.role}
            onRoleChange={onRoleChange}
          />
        </div>
      </div>
    </div>
  );
}
