"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getInvitableUsers,
  submitGroupInvitation,
  cancelGroupInvitation,
} from "@/app/lib/services/group";
import { InvitableUser } from "@/app/lib/types/group";

export type InviteListState = ReturnType<typeof useInviteList>;

export function useInviteList(groupId: string) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<InvitableUser[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    getInvitableUsers(groupId)
      .then((resp) => {
        if (!resp) return;

        setList(resp.list ?? []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return list;

    return list.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(q);
    });
  }, [query, list]);

  async function toggleInvite(userId: string, isInvited: boolean) {
    const action = isInvited ? cancelGroupInvitation : submitGroupInvitation;

    setPendingId(userId);
    const resp = await action(groupId, userId);
    setPendingId(null);

    if (!resp) return;

    setList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isInvited: !isInvited } : user,
      ),
    );
  }

  function removeUser(userId: string) {
    setList((prev) => prev.filter((u) => u.id !== userId));
  }

  return {
    list: filtered,
    loading,

    query,
    setQuery,

    pendingId,
    toggleInvite,
    removeUser,
  };
}
