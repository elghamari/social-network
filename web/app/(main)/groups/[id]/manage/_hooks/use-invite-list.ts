"use client";

import { useEffect, useRef, useState } from "react";

import {
  getInvitableUsers,
  submitGroupInvitation,
  cancelGroupInvitation,
} from "@/app/lib/services/group";
import type { InvitableUser } from "@/app/lib/types/group";
import { useIntersectionObserver } from "../../_hooks/use-intersection-observer";

export type InviteListState = ReturnType<typeof useInviteList>;

const PAGE_SIZE = 20;

export function useInviteList(groupId: string) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [list, setList] = useState<InvitableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  // ── Debounce search ────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // ── Initial fetch / search change ──────────────────
  useEffect(() => {
    let canceled = false;

    async function run() {
      fetchingRef.current = true;
      setLoading(true);
      setList([]);
      setCursor("");
      setHasMore(false);

      try {
        const resp = await getInvitableUsers(groupId, debouncedQuery, "");
        if (!resp || canceled) return;

        const users = resp.users ?? [];

        setList(users);
        setCursor(users.at(-1)?.createdAt ?? "");
        setHasMore(users.length === PAGE_SIZE);
      } finally {
        fetchingRef.current = false;
        if (!canceled) setLoading(false);
      }
    }

    run();

    return () => {
      canceled = true;
    };
  }, [debouncedQuery]);

  // ── Load more ──────────────────────────────────────
  async function loadMore() {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const resp = await getInvitableUsers(groupId, debouncedQuery, cursor);
      if (!resp) return;

      const users = resp.users ?? [];

      setList((prev) => [...prev, ...users]);
      setCursor(users.at(-1)?.createdAt ?? "");
      setHasMore(users.length === PAGE_SIZE);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }

  const markerRef = useIntersectionObserver(loadMore, hasMore);

  // ── Actions ────────────────────────────────────────
  async function toggleInvite(
    userId: string,
    isInvited: boolean,
  ): Promise<boolean> {
    const action = isInvited ? cancelGroupInvitation : submitGroupInvitation;

    setPendingId(userId);
    const resp = await action(groupId, userId);
    setPendingId(null);

    if (!resp) return false;

    setList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isInvited: !isInvited } : user,
      ),
    );

    return true;
  }

  function removeUser(userId: string) {
    setList((prev) => prev.filter((u) => u.id !== userId));
  }

  return {
    list,
    loading,
    markerRef,

    query,
    setQuery,

    pendingId,
    toggleInvite,
    removeUser,
  };
}
