import type { Group } from "@/app/lib/types/group";
import { useState } from "react";
import GroupActions from "../../_components/group-actions";

type Props = {
  group: Group;
  onRequest: (pending: boolean) => void;
};

export default function GroupHeader({ group, onRequest }: Props) {
  const isCreator = group.role === "creator";
  const isMember = group.role === "creator" || group.role === "member";
  // const isPending = group.role === "PENDING";

  return (
    <div className="gd__header">
      <div className={`gd__cover ${group.coverPath ? "" : "gd__cover--empty"}`}>
        {group.coverPath && (
          <img
            src={group.coverPath}
            alt={`${group.title} cover`}
            className="gd__cover-img"
          />
        )}
      </div>

      <div className="gd__info">
        <div className="gd__info-text">
          <h1 className="gd__title">{group.title}</h1>
          <p className="gd__description">{group.description}</p>
          <span className="gd__count">
            {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <GroupActions
          type="header"
          id={group.id}
          role={group.role}
          onRoleChange={onRequest}
        />
      </div>
    </div>
  );
}
