"use client";

import { useEffect, useRef, useState } from "react";

import { getEvents } from "@/app/lib/services/group";
import type { Event, EventResponse } from "@/app/lib/types/group";
import { formatDate } from "@/app/lib/utils/format-time";
import { useIntersectionObserver } from "../../../../../ui/use-intersection-observer";

const PAGE_SIZE = 20;

export function useEvents(groupId: string) {
  const [list, setList] = useState<Event[]>([]);
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
        const resp = await getEvents(groupId, "");
        if (!resp || canceled) return;

        const events = resp.events ?? [];

        setList(events);
        setCursor(events.at(-1)?.id ?? "");
        setHasMore(events.length === PAGE_SIZE);
      } finally {
        fetchingRef.current = false;
        if (!canceled) setLoading(false);
      }
    }

    run();

    return () => {
      canceled = true;
    };
  }, [groupId]);

  // ── Load more ──────────────────────────────────────
  async function loadMore() {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const resp = await getEvents(groupId, cursor);
      if (!resp) return;

      const events = resp.events ?? [];

      setList((prev) => [...prev, ...events]);
      setCursor(events.at(-1)?.id ?? "");
      setHasMore(events.length === PAGE_SIZE);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }

  const markerRef = useIntersectionObserver(loadMore, hasMore);

  // ── Actions ────────────────────────────────────────
  function addEvent(event: Event) {
    const formatted = {
      ...event,
      date: formatDate(event.date),
    };

    setList((prev) => [formatted, ...prev]);
  }

  function updateEvent(eventId: string, response: EventResponse) {
    setList((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const prevResponse = event.response;
        if (prevResponse === response) return event;

        let goingCnt = event.goingCnt;
        let notGoingCnt = event.notGoingCnt;

        if (prevResponse === "GOING") goingCnt--;
        if (prevResponse === "NOT_GOING") notGoingCnt--;

        if (response === "GOING") goingCnt++;
        if (response === "NOT_GOING") notGoingCnt++;

        return {
          ...event,
          goingCnt,
          notGoingCnt,
          response,
        };
      }),
    );
  }

  return {
    events: list,
    loading,
    markerRef,
    actions: {
      addEvent,
      updateEvent,
    },
  };
}
