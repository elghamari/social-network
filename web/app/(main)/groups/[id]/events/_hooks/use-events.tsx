import { useCallback, useEffect, useRef, useState } from "react";

import { getEvents } from "@/app/lib/services/group";
import { Event, EventResponse, LoadingStatus } from "@/app/lib/types/group";
import { formatDate } from "@/app/lib/utils/format";

const LIST_SIZE = 20;

export function useEvents(groupId: string) {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const stateRef = useRef({ loading, cursor, hasMore });
  stateRef.current = { loading, cursor, hasMore };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const s = stateRef.current;

    setLoading(true);

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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore();
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
    event.date = formatDate(event.date);

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
