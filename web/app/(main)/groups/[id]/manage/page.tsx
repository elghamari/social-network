"use client";

import "./page.css";

import GroupInviteList from "./_components/group-invite-list";
import { useGroupContext } from "../_context/group-context";
import GroupJoinRequestList from "./_components/group-join-request-list";

export default function Manage() {
  const { id, role } = useGroupContext();

  const isCreator = role === "CREATOR";

  return (
    <div className={`gd-manage ${isCreator ? "gd-manage--split" : ""}`}>
      <GroupInviteList groupId={id} />

      {isCreator && <GroupJoinRequestList groupId={id} />}
    </div>
  );
}
