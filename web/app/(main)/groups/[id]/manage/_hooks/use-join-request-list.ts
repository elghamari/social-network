"use client";

import { useEffect, useRef, useState } from "react";

import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "@/app/lib/services/group";
import type { JoinRequestUser } from "@/app/lib/types/group";
import { useIntersectionObserver } from "@/app/ui/use-intersection-observer";

export type JoinRequestState = ReturnType<typeof useJoinRequestList>;

const PAGE_SIZE = 20;

export function useJoinRequestList(groupId: string) {
  const [list, setList] = useState<JoinRequestUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const fetchingRef = useRef(false);

  // ── Initial fetch ──────────────────────────────────
  useEffect(() => {
    let canceled = false;

    async function run() {
      fetchingRef.current = true;
      setLoading(true);
      setList([]);
      setCursor("");
      setHasMore(false);

      try {
        const resp = await getJoinRequests(groupId, "");
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
  }, []);

  // ── Load more ──────────────────────────────────────
  async function loadMore() {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const resp = await getJoinRequests(groupId, cursor);
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

  function removeUser(userId: string) {
    setList((prev) => prev.filter((u) => u.id !== userId));
  }

  return {
    list,
    loading,
    markerRef,

    removeUser,
  };
}
