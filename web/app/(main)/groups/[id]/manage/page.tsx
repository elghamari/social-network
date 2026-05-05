"use client";

import "./page.css";

import GroupInviteList from "./_components/group-invite-list";
import GroupJoinRequestList from "./_components/group-join-request-list";
import { useGroupContext } from "../_context/context";
import { useInviteList } from "./_hooks/use-invite-list";
import { useJoinRequestList } from "./_hooks/use-join-request-list";

export default function ManagePage() {
  const { id, role } = useGroupContext();
  const isCreator = role === "creator";

  const invites = useInviteList(id);

  return (
    <div className={`gd-manage ${isCreator ? "gd-manage--split" : ""}`}>
      <GroupInviteList invites={invites} />

      {isCreator && (
        <CreatorJoinRequests
          groupId={id}
          onApproved={(userId) => {
            invites.removeUser(userId);
          }}
        />
      )}
    </div>
  );
}

function CreatorJoinRequests({
  groupId,
  onApproved,
}: {
  groupId: string;
  onApproved: (userId: string) => void;
}) {
  const requests = useJoinRequestList(groupId);

  async function handleApprove(userId: string) {
    const resp = await requests.approve(userId);
    if (!resp) return;

    onApproved(userId);
  }

  return (
    <GroupJoinRequestList
      requests={requests}
      onApprove={handleApprove}
    />
  );
}