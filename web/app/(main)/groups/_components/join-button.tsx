"use client";

import { useState } from "react";

import { showToast } from "@/app/ui/layout/toast-store";
import { cancelJoinRequest, submitJoinRequest } from "@/app/lib/services/group";
import { useRouter } from "next/navigation";

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

type GroupJoinButtonProps = {
  groupId: string;
  groupRole: string;
  type: "card" | "header";
};

export default function GroupJoinButton({
  groupId,
  groupRole,
  type,
}: GroupJoinButtonProps) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(groupRole === "PENDING");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const action = isPending ? cancelJoinRequest : submitJoinRequest;

    const resp = await action(groupId);
    setLoading(false);
    switch (resp.status) {
      case 401:
        router.push("/login");
        break;

      case 400:
        showToast(resp.error);
        break;

      case 500:
        throw new Error("Internal Server Error");

      default:
        setIsPending(!isPending);
    }
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
