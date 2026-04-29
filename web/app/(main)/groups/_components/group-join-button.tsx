"use client";

import { useState } from "react";

import { cancelJoinRequest, submitJoinRequest } from "@/app/lib/services/group";

const styles = {
  card: {
    request: "group-card__badge group-card__badge--request",
    pending: "group-card__badge group-card__badge--pending",
  },
  header: {
    request: "gd__badge gd__badge--request",
    pending: "gd__badge gd__badge--pending",
  },
};

type Props = {
  groupId: string;
  groupRole: string;
  type: "card" | "header";
};

export default function GroupJoinButton({ groupId, groupRole, type }: Props) {
  const [isPending, setIsPending] = useState(groupRole === "PENDING");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const action = isPending ? cancelJoinRequest : submitJoinRequest;

    await action(groupId);
    setIsPending(!isPending);
    ``;
    setLoading(false);
  };

  const style = styles[type];

  return (
    <button
      className={isPending ? style.pending : style.request}
      onClick={handleRequest}
      disabled={loading}
    >
      {loading ? "..." : isPending ? "Pending" : "Request"}
    </button>
  );
}
