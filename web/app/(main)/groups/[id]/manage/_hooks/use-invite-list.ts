"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getInvitableUsers,
  submitGroupInvitation,
  cancelGroupInvitation,
} from "@/app/lib/services/group";
import { InvitableUser, LoadingStatus } from "@/app/lib/types/group";
import { useIntersectionObserver } from "../../_hooks/use-intersection-observer";

export type InviteListState = ReturnType<typeof useInviteList>;

const LIST_SIZE = 20;

export function useInviteList(groupId: string) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [list, setList] = useState<InvitableUser[]>([]);
  const [status, setStatus] = useState<LoadingStatus>("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const stateRef = useRef({
    groupId,
    query: debouncedQuery,
    status,
    cursor,
    hasMore,
  });
  stateRef.current = {
    groupId,
    query: debouncedQuery,
    status,
    cursor,
    hasMore,
  };

  // ── Debounce search query ──────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // ── Fetch on first load or search change ──────────────
  useEffect(() => {
    let canceled = false;

    async function run() {
      setStatus("loading");
      setList([]);
      setCursor("");
      setHasMore(false);

      try {
        const resp = await getInvitableUsers(groupId, debouncedQuery, "");
        if (!resp || canceled) return;

        const users = resp.users ?? [];
        const nextCursor = users.at(-1)?.id ?? "";
        const nextHasMore = users.length === LIST_SIZE;

        setList(users);
        setCursor(nextCursor);
        setHasMore(nextHasMore);
      } finally {
        if (!canceled) setStatus("");
      }
    }

    run();

    return () => {
      canceled = true;
    };
  }, [debouncedQuery]);

  // ── Load more ──────────────────────────────────────
  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (s.status || !s.hasMore) return;

    stateRef.current.status = "loading-more";
    setStatus("loading-more");

    try {
      const resp = await getInvitableUsers(s.groupId, s.query, s.cursor);
      if (!resp) return;

      const users = resp.users ?? [];
      const nextCursor = users.at(-1)?.id ?? "";
      const nextHasMore = users.length === LIST_SIZE;

      setList((prev) => [...prev, ...users]);
      setCursor(nextCursor);
      setHasMore(nextHasMore);
    } finally {
      stateRef.current.status = "";
      setStatus("");
    }
  }, []);

  const markerRef = useIntersectionObserver(loadMore, hasMore && !status);

  // ── Actions ────────────────────────────────────────
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
    list,
    status,
    markerRef,

    query,
    setQuery,

    pendingId,
    toggleInvite,
    removeUser,
  };
}
