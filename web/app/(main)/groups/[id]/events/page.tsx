"use client";
<<<<<<< HEAD

=======
>>>>>>> WebSocket
import "./page.css";

import { useState } from "react";

import { useGroupContext } from "../_context/context";
import { useEvents } from "./_hooks/use-events";

<<<<<<< HEAD
import EventList from "./_components/event-list";
import EventFormModal from "./_components/event-form-modal";

import type { Event } from "@/app/lib/types/group";
=======
import EventCard from "./_components/event-card";
import EventFormModal from "./_components/event-form-modal";

import { Event } from "@/app/lib/types/group";
>>>>>>> WebSocket

export default function EventsPage() {
  const { id } = useGroupContext();

<<<<<<< HEAD
  const { events, loading, markerRef, actions } = useEvents(id);
  const [showModal, setShowModal] = useState(false);

=======
  const { events, status, markerRef, actions } = useEvents(id);
  const [showModal, setShowModal] = useState(false);

  if (status === "loading") return <Skeleton />;

>>>>>>> WebSocket
  function handleCreated(event: Event) {
    actions.addEvent(event);
    setShowModal(false);
  }

  return (
    <div className="gd-card">
      <div className="gd-card__header">
        <h2 className="gd-card__title">Events</h2>
        <button
          type="button"
          className="gd-btn"
          onClick={() => setShowModal(true)}
        >
          + Create Event
        </button>
      </div>

      <div className="gd-card__body">
<<<<<<< HEAD
        <EventList
          events={events}
          loading={loading}
          markerRef={markerRef}
          groupId={id}
          onResponse={actions.updateEvent}
        />
      </div>

=======
        {events.length === 0 ? (
          <div className="gd-empty">No events yet.</div>
        ) : (
          <div className="gd-events">
            {events.map((event) => (
              <EventCard
                key={event.id}
                groupId={id}
                event={event}
                onResponse={actions.updateEvent}
              />
            ))}
          </div>
        )}
      </div>

      {status === "loading-more" && <LoadingMore />}

      <div ref={markerRef} aria-hidden="true" />

>>>>>>> WebSocket
      {showModal && (
        <EventFormModal
          groupId={id}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
<<<<<<< HEAD
=======

function Skeleton() {
  return (
    <div className="gd-card">
      <div className="gd-card__header">
        <div className="skeleton" style={{ height: 16, width: 60 }} />
        <div
          className="skeleton"
          style={{
            height: 34,
            width: 120,
            borderRadius: "var(--radius-md)",
          }}
        />
      </div>

      <div className="gd-card__body">
        <div className="gd-events">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="gd-event">
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
            style={{ height: 32, width: 70, borderRadius: "var(--radius-sm)" }}
          />
          <div
            className="skeleton"
            style={{ height: 32, width: 85, borderRadius: "var(--radius-sm)" }}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingMore() {
  return (
    <div className="groups-loading-more">
      <div className="groups-loading-more__spinner" />
    </div>
  );
}
>>>>>>> WebSocket
