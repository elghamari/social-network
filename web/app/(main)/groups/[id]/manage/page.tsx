"use client";

import "./page.css";

import GroupInviteList from "./_components/group-invite-list";
import { useGroupContext } from "../_context/context";
import GroupJoinRequestList from "./_components/group-join-request-list";
import { useInviteList } from "./_hooks/use-invite-list";
import { useJoinRequestList } from "./_hooks/use-join-request-list";

export default function ManagePage() {
  const { id, role } = useGroupContext();

  const isCreator = role === "CREATOR";

  const invites = useInviteList(id);
  const requests = useJoinRequestList(id);

  async function handleApprove(userId: string) {
    const resp = await requests.approve(userId);
    if (!resp) return;

    invites.removeUser(userId);
  }

  return (
    <div className={`gd-manage ${isCreator ? "gd-manage--split" : ""}`}>
      <GroupInviteList invites={invites} />

      {isCreator && (
        <GroupJoinRequestList requests={requests} onApprove={handleApprove} />
      )}
    </div>
  );
}
