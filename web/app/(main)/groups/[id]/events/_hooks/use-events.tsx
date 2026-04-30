import { useEffect, useState } from "react";

import { getEvents } from "@/app/lib/services/group";
import { Event, EventResponse } from "@/app/lib/types/group";
import { formatDate } from "@/app/lib/utils/format";

export function useEvents(groupId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getEvents(groupId)
      .then((resp) => {
        if (!resp) return;

        setEvents(resp.events);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function addEvent(event: Event) {
    event.date = formatDate(event.date);

    setEvents((prev) => [...prev, event]);
  }

  async function updateEvent(eventId: string, response: EventResponse) {
    setEvents((prev) =>
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
    events,
    loading,
    actions: {
      addEvent,
      updateEvent,
    },
  };
}
