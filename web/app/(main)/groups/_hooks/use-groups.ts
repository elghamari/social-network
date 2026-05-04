"use client";

import { useEffect, useRef, useState } from "react";

import { getGroups } from "@/app/lib/services/group";
import type { Group, GroupTab } from "@/app/lib/types/group";
import { useIntersectionObserver } from "../../../ui/use-intersection-observer";

const PAGE_SIZE = 20;

export function useGroups(tab: GroupTab, query: string) {
  const [list, setList] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const fetchingRef = useRef(false);

  useEffect(() => {
    let canceled = false;

    async function run() {
      fetchingRef.current = true;
      setLoading(true);
      setList([]);
      setCursor("");
      setHasMore(false);

      try {
        const resp = await getGroups(tab, query, "");
        if (!resp || canceled) return;

        const groups = resp.groups ?? [];

        setList(groups);
        setCursor(groups.at(-1)?.id ?? "");
        setHasMore(groups.length === PAGE_SIZE);
      } finally {
        fetchingRef.current = false;
        if (!canceled) setLoading(false);
      }
    }

    run();

    return () => {
      canceled = true;
    };
  }, [tab, query]);

  async function loadMore() {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const resp = await getGroups(tab, query, cursor);
      if (!resp) return;

      const groups = resp.groups ?? [];

      setList((prev) => [...prev, ...groups]);
      setCursor(groups.at(-1)?.id ?? "");
      setHasMore(groups.length === PAGE_SIZE);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }

  const markerRef = useIntersectionObserver(loadMore, hasMore);

  function addGroup(group: Group) {
    if (tab !== "joined") return;

    setList((prev) => [group, ...prev]);
  }

  function removeGroup(groupId: string) {
    setList((prev) => prev.filter((g) => g.id !== groupId));
  }

  return {
    list,
    loading,
    markerRef,
    actions: {
      addGroup,
      removeGroup,
    },
  };
}
