// app/(main)/groups/_components/group-actions.tsx
"use client";

import { useState } from "react";

import {
  acceptGroupInvitation,
  declineGroupInvitation,
  revokeJoinRequest,
  sendJoinRequest,
} from "@/app/lib/services/group";

import { GroupRole } from "@/app/lib/types/group";

// type LoadingState = "" | "request" | "cancel" | "accept" | "reject";

type Props = {
  type: "card" | "header";
  id: string;
  role: GroupRole;
  onRoleChange: (nextRole?: GroupRole) => void;
};

export default function GroupActions({
  type = "card",
  id,
  role,
  onRoleChange,
}: Props) {
  const [loading, setLoading] = useState(false);

  const isCreator = role === "creator";
  const isMember = role === "member";
  const isJoined = isCreator || isMember;
  const isPendingRequest = role === "pending_request";
  const isPendingInvitation = role === "pending_invitation";

  const prefix = type === "card" ? "group-card" : "gd";

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRequest = async (e: React.MouseEvent) => {
    stop(e);

    setLoading(true);
    const resp = await sendJoinRequest(id);
    setLoading(false);
    if (resp) onRoleChange("pending_request");
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    stop(e);

    setLoading(true);
    const resp = await revokeJoinRequest(id);
    setLoading(false);
    if (resp) onRoleChange("none");
  };

  const handleAcceptInv = async (e: React.MouseEvent) => {
    stop(e);

    setLoading(true);
    const resp = await acceptGroupInvitation(id);
    setLoading(false);
    if (resp) onRoleChange("member");
  };

  const handleDeclineInv = async (e: React.MouseEvent) => {
    stop(e);

    setLoading(true);
    const resp = await declineGroupInvitation(id);
    setLoading(false);
    if (resp) onRoleChange("none");
  };

  if (isJoined) {
    return (
      <span className={`${prefix}__badge ${prefix}__badge--member`}>
        {isCreator ? "Creator" : "Joined"}
      </span>
    );
  }

  if (isPendingInvitation) {
    return (
      <div className={`${prefix}__actions`}>
        <button
          className={`${prefix}__btn ${prefix}__btn--ghost`}
          onClick={handleDeclineInv}
          disabled={loading} 
        >
          {loading ? "..." : "Decline"}
        </button>
        <button
          className={`${prefix}__btn ${prefix}__btn--primary`}
          onClick={handleAcceptInv}
          disabled={loading}
        >
          {loading ? "..." : "Accept"}
        </button>
      </div>
    );
  }

  if (isPendingRequest) {
    return (
      <button
        className={`${prefix}__badge ${prefix}__badge--pending`}
        onClick={handleCancelRequest}
        disabled={loading}
      >
        {loading ? "..." : "Cancel Request"}
      </button>
    );
  }

  return (
    <button
      className={`${prefix}__badge ${prefix}__badge--request`}
      onClick={handleRequest}
      disabled={loading}
    >
      {loading ? "..." : "Request"}
    </button>
  );
}
