"use client";

import "./page.css";

import GroupInviteList from "./_components/invite-list";
import { useGroupContext } from "../_context/context";
import GroupJoinRequestList from "./_components/join-request-list";

export default function ManagePage() {
  const { id, role } = useGroupContext();

  const isCreator = role === "CREATOR";

  return (
    <div className={`gd-manage ${isCreator ? "gd-manage--split" : ""}`}>
      <GroupInviteList groupId={id} />

      {isCreator && <GroupJoinRequestList groupId={id} />}
    </div>
  );
}
