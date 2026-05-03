"use client";

import type { Event, EventResponse } from "@/app/lib/types/group";
import EventCard from "./event-card";

type Props = {
  events: Event[];
  loading: boolean;
  markerRef: React.RefObject<HTMLDivElement | null>;
  groupId: string;
  onResponse: (eventId: string, response: EventResponse) => void;
};

const SKELETON_COUNT = 3;

export default function EventList({
  events,
  loading,
  markerRef,
  groupId,
  onResponse,
}: Props) {
  if (!loading && events.length === 0) {
    return <div className="gd-empty">No events yet.</div>;
  }

  return (
    <div className="gd-events">
      {events.map((event) => (
        <EventCard
          key={event.id}
          groupId={groupId}
          event={event}
          onResponse={onResponse}
        />
      ))}

      {loading && <SkeletonRows />}

      <div ref={markerRef} aria-hidden="true" />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className="gd-event gd-event--skeleton">
          <div className="gd-event__body">
            <div className="skeleton" style={{ height: 16, width: "45%" }} />
            <div
              className="skeleton"
              style={{ height: 13, width: "80%", marginTop: 8 }}
            />
            <div
              className="skeleton"
              style={{ height: 13, width: "60%", marginTop: 4 }}
            />
            <div
              className="skeleton"
              style={{ height: 12, width: "30%", marginTop: 12 }}
            />
          </div>

          <div className="gd-event__side">
            <div className="gd-event__counts">
              <div className="skeleton" style={{ height: 12, width: 60 }} />
              <div className="skeleton" style={{ height: 12, width: 70 }} />
            </div>

            <div className="gd-event__response">
              <div
                className="skeleton"
                style={{
                  height: 32,
                  width: 70,
                  borderRadius: "var(--radius-sm)",
                }}
              />
              <div
                className="skeleton"
                style={{
                  height: 32,
                  width: 85,
                  borderRadius: "var(--radius-sm)",
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
