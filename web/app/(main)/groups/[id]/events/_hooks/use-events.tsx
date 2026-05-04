<<<<<<< HEAD
"use client";

import { useEffect, useRef, useState } from "react";

import { getEvents } from "@/app/lib/services/group";
import type { Event, EventResponse } from "@/app/lib/types/group";
import { formatDate } from "@/app/lib/utils/format";
import { useIntersectionObserver } from "../../../../../ui/use-intersection-observer";

const PAGE_SIZE = 20;

export function useEvents(groupId: string) {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const fetchingRef = useRef(false);

  // ── Initial fetch ──────────────────────────────────
=======
import { useCallback, useEffect, useRef, useState } from "react";

import { getEvents } from "@/app/lib/services/group";
import { Event, EventResponse, LoadingStatus } from "@/app/lib/types/group";
import { FormatTime } from "@/app/lib/utils/format-time";

const LIST_SIZE = 20;

export function useEvents(groupId: string) {
  const [list, setList] = useState<Event[]>([]);
  const [status, setStatus] = useState<LoadingStatus>("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);

>>>>>>> WebSocket
  useEffect(() => {
    let canceled = false;

    async function run() {
<<<<<<< HEAD
      fetchingRef.current = true;
      setLoading(true);
=======
      setStatus("loading");
>>>>>>> WebSocket
      setList([]);
      setCursor("");
      setHasMore(false);

      try {
        const resp = await getEvents(groupId, "");
        if (!resp || canceled) return;

        const events = resp.events ?? [];
<<<<<<< HEAD

        setList(events);
        setCursor(events.at(-1)?.id ?? "");
        setHasMore(events.length === PAGE_SIZE);
      } finally {
        fetchingRef.current = false;
        if (!canceled) setLoading(false);
=======
        const nextCursor = events.at(-1)?.id ?? "";
        const nextHasMore = events.length === LIST_SIZE;

        setList(events);
        setCursor(nextCursor);
        setHasMore(nextHasMore);
      } finally {
        if (!canceled) setStatus("");
>>>>>>> WebSocket
      }
    }

    run();

    return () => {
      canceled = true;
    };
<<<<<<< HEAD
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
=======
  }, []);

  const stateRef = useRef({ status, cursor, hasMore });
  stateRef.current = { status, cursor, hasMore };

  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (s.status || !s.hasMore) return;

    setStatus("loading-more");

    try {
      const resp = await getEvents(groupId, s.cursor);
      if (!resp) return;

      const events = resp.events ?? [];
      const nextCursor = events.at(-1)?.id ?? "";
      const nextHasMore = events.length === LIST_SIZE;

      setList((prev) => [...prev, ...events]);
      setCursor(nextCursor);
      setHasMore(nextHasMore);
    } finally {
      setStatus("");
    }
  }, []);

  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = markerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  });

  function addEvent(event: Event) {
    event.date = FormatTime(event.date);

    setList((prev) => [...prev, event]);
  }

  async function updateEvent(eventId: string, response: EventResponse) {
    setList((prev) =>
      prev.map((event) => {
        const prevResponse = event.response;

        if (prevResponse === response) return event;

        let newGoingCnt = event.goingCnt;
        let newNotGoingCnt = event.notGoingCnt;

        if (prevResponse === "GOING") {
          newGoingCnt--;
        } else if (prevResponse === "NOT_GOING") {
          newNotGoingCnt--;
        }

        if (response === "GOING") {
          newGoingCnt++;
        } else if (response === "NOT_GOING") {
          newNotGoingCnt++;
        }
        return event.id === eventId
          ? {
              ...event,
              goingCnt: newGoingCnt,
              notGoingCnt: newNotGoingCnt,
              response: response,
            }
          : event;
>>>>>>> WebSocket
      }),
    );
  }

  return {
    events: list,
<<<<<<< HEAD
    loading,
=======
    status,
>>>>>>> WebSocket
    markerRef,
    actions: {
      addEvent,
      updateEvent,
    },
  };
}
