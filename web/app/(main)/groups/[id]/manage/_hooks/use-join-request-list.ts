"use client";

import { useEffect, useState } from "react";

import {
  approveJoinRequest,
  listJoinRequests,
  rejectJoinRequest,
} from "@/app/lib/services/group";
import { JoinRequestUser } from "@/app/lib/types/group";

export type JoinRequestState = ReturnType<typeof useJoinRequestList>;

export function useJoinRequestList(groupId: string, enabled: boolean) {
  const [list, setList] = useState<JoinRequestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    listJoinRequests(groupId)
      .then((resp) => {
        if (!resp) return;

        setList(resp.list ?? []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled]);

  async function approve(userId: string): Promise<boolean> {
    setPendingId(userId);
    const resp = await approveJoinRequest(groupId, userId);
    setPendingId(null);

    if (!resp) return false;

    setList((prev) => prev.filter((user) => user.id !== userId));

    return true;
  }

  async function reject(userId: string) {
    setPendingId(userId);
    const resp = await rejectJoinRequest(groupId, userId);
    setPendingId(null);

    if (!resp) return;

    setList((prev) => prev.filter((user) => user.id !== userId));
  }

  return { list, loading, pendingId, approve, reject };
}
