"use client";

import "./page.css";

import GroupInviteList from "./_components/group-invite-list";
import GroupJoinRequestList from "./_components/group-join-request-list";
import { useGroupContext } from "../_context/context";
import { useInviteList } from "./_hooks/use-invite-list";
import { useJoinRequestList } from "./_hooks/use-join-request-list";
import {
  approveJoinRequest,
  rejectJoinRequest,
  revokeGroupInvitation,
  sendGroupInvitation,
} from "@/app/lib/services/group";

export default function ManagePage() {
  const ctx = useGroupContext();

  const { id, role } = ctx.group;

  const isCreator = role === "creator";

  const invites = useInviteList(id);
  const requests = isCreator ? useJoinRequestList(id) : null;

  async function handleInvite(userId: string, isInvited: boolean) {
    if (isInvited) {
      const resp = await revokeGroupInvitation(id, userId);
      if (!resp) return;

      invites.toggleInvite(userId);
      return;
    }

    const resp = await sendGroupInvitation(id, userId);
    if (!resp) return;

    if (resp.result === "user_joined") {
      invites.removeUser(userId);
      requests.removeUser(userId);

      ctx.updateGroup((prev) => ({
        ...prev,
        memberCount: prev.memberCount + 1,
      }));
    } else {
      invites.toggleInvite(userId);
    }
  }

  async function handleApprove(userId: string) {
    const resp = await approveJoinRequest(id, userId);
    if (!resp) return;

    requests.removeUser(userId);
    invites.removeUser(userId);

    ctx.updateGroup((prev) => ({ ...prev, memberCount: prev.memberCount + 1 }));
  }

  async function handleReject(userId: string) {
    const resp = await rejectJoinRequest(id, userId);
    if (!resp) return;

    requests.removeUser(userId);
  }

  return (
    <div className={`gd-manage ${isCreator ? "gd-manage--split" : ""}`}>
      <GroupInviteList invites={invites} onInvite={handleInvite} />

      {isCreator && (
        <GroupJoinRequestList
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
