"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getGroups } from "@/app/lib/services/group";
import type { Group, GroupTab } from "@/app/lib/types/group";

type Status = "loading" | "loading-more" | "";

export function useGroups(tab: GroupTab, query: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [status, setStatus] = useState<Status>("");
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string>("");

  const stateRef = useRef({ tab, query, cursor, status, hasMore });
  stateRef.current = { tab, query, cursor, status, hasMore };

  // ── Initial fetch ──────────────────────────────────
  useEffect(() => {
    let canceled = false;

    setStatus("loading");
    setGroups([]);
    setCursor("");
    setHasMore(false);

    getGroups(tab, query, cursor).then((resp) => {
      if (!resp || canceled) return;

      setGroups(resp.groups ?? []);
      setHasMore(resp.hasMore ?? false);
      setCursor(resp.cursor ?? "");
      setStatus("");
    });

    return () => {
      canceled = true;
    };
  }, [query, tab]);

  // ── Load more ───────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (s.status || !s.hasMore) return;

    setStatus("loading-more");

    const resp = await getGroups(tab, query, cursor);
    setStatus("");

    if (!resp) return;

    setGroups((prev) => [...prev, ...(resp.groups ?? [])]);
    setHasMore(resp.hasMore ?? false);
    setCursor(resp.cursor ?? "");
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
  }, []);

  // ── Actions ───────────────────────────────────
  function addGroup(group: Group) {
    if (tab !== "joined") return;

    setGroups((prev) => [...prev, group]);
  }

  function removeGroup(groupId: string) {
    if (tab === "joined") return;

    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }

  return {
    groups,
    status,
    markerRef,
    actions: {
      addGroup: addGroup,
      rmGroup: removeGroup,
    },
  };
}
