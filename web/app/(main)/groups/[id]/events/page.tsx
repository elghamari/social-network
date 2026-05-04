"use client";
import "./page.css";

import { useState } from "react";

import { useGroupContext } from "../_context/context";
import { useEvents } from "./_hooks/use-events";

import EventList from "./_components/event-list";
import EventFormModal from "./_components/event-form-modal";

import type { Event } from "@/app/lib/types/group";

export default function EventsPage() {
  const { id } = useGroupContext();

  const { events, loading, markerRef, actions } = useEvents(id);
  const [showModal, setShowModal] = useState(false);

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
        <EventList
          events={events}
          loading={loading}
          markerRef={markerRef}
          groupId={id}
          onResponse={actions.updateEvent}
        />
      </div>

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
