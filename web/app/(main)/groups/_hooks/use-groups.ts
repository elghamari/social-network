"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getGroups } from "@/app/lib/services/group";
import type { Group, GroupTab, LoadingStatus } from "@/app/lib/types/group";

const LIST_SIZE = 20;

export function useGroups(tab: GroupTab, query: string) {
  const [list, setList] = useState<Group[]>([]);
  const [status, setStatus] = useState<LoadingStatus>("");
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string>("");

  const stateRef = useRef({ tab, query, cursor, status, hasMore });
  stateRef.current = { tab, query, cursor, status, hasMore };

  // ── Initial fetch ──────────────────────────────────
  useEffect(() => {
    let canceled = false;

    async function run() {
      setStatus("loading");
      setList([]);
      setCursor("");
      setHasMore(false);

      try {
        const resp = await getGroups(tab, query, "");
        if (!resp || canceled) return;

        const groups = resp.groups ?? [];
        const nextCursor = groups.at(-1)?.id ?? "";
        const nextHasMore = groups.length === LIST_SIZE;

        setList(groups);
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
  }, [query, tab]);

  // ── Load more ───────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (s.status || !s.hasMore) return;

    setStatus("loading-more");

    try {
      const resp = await getGroups(s.tab, s.query, s.cursor);
      if (!resp) return;

      const groups = resp.groups ?? [];
      const nextCursor = groups.at(-1)?.id ?? "";
      const nextHasMore = groups.length === LIST_SIZE;

      setList((prev) => [...prev, ...groups]);
      setCursor(nextCursor);
      setHasMore(nextHasMore);
    } finally {
      setStatus("");
    }
  }, []);

  // ── Intersection marker ───────────────────────────────────
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = markerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // ── Actions ───────────────────────────────────
  function addGroup(group: Group) {
    if (tab !== "joined") return;

    setList((prev) => [group, ...prev]);
  }

  function removeGroup(groupId: string) {
    if (tab === "joined") return;

    setList((prev) => prev.filter((g) => g.id !== groupId));
  }

  return {
    groups: list,
    status,
    markerRef,
    actions: {
      addGroup: addGroup,
      rmGroup: removeGroup,
    },
  };
}
