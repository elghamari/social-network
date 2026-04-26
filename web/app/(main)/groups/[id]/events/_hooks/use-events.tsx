import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getEvents } from "@/app/lib/services/group";
import { showToast } from "@/app/ui/layout/toast-store";
import { Event, EventStatus } from "@/app/lib/types/group";

export function useEvents(groupId: string) {
  const router = useRouter();

  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getEvents(groupId)
      .then((resp) => {
        switch (resp.status) {
          case 401:
            router.push("/login");
            break;

          case 400:
            showToast(resp.error);
            break;

          case 500:
            showToast("Something went wrong. Try again later.");
            break;

          default:
            setEvents(resp.events);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function addEvent(event: Event) {
    let newEvents = events || [];
    newEvents.push(event);
    setEvents(newEvents);
  }

  function setEventStatus(eventId: string, status: EventStatus) {
    setEvents(
      (prev) =>
        prev?.map((event) =>
          event.id === eventId ? { ...event, status: status } : event,
        ) ?? null,
    );
  }

  return {
    events,
    loading,
    actions: {
      addEvent: addEvent,
      setEventStatus: setEventStatus,
    },
  };
}
