"use client";
import "./page.css";

import { useState } from "react";

import { useGroupContext } from "../_context/context";
import { useEvents } from "./_hooks/use-events";

import EventFormModal from "./_components/event-form-modal";

import { Event, EventFormInput } from "@/app/lib/types/group";

const INITIAL_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Weekly Design Critique",
    description:
      "Bring one screen and get fast, useful feedback from the group.",
    date: "Apr 24, 2026 — 7:00 PM",
    status: "GOING",
    goingCnt: 14,
    notGoingCnt: 3,
  },
  {
    id: "e2",
    title: "Figma Jam Session",
    description: "Collaborative ideation around social app UX.",
    date: "Apr 28, 2026 — 6:30 PM",
    status: null,
    goingCnt: 7,
    notGoingCnt: 1,
  },
  {
    id: "e3",
    title: "Typography Deep Dive",
    description: "Type systems, pairing strategies, and vertical rhythm.",
    date: "May 02, 2026 — 5:00 PM",
    status: "NOT_GOING",
    goingCnt: 9,
    notGoingCnt: 6,
  },
  {
    id: "e4",
    title: "Figma Jam Session",
    description: "Collaborative ideation around social app UX.",
    date: "Apr 28, 2026 — 6:30 PM",
    status: null,
    goingCnt: 7,
    notGoingCnt: 1,
  },
];

export default function EventsPage() {
  const { id, role } = useGroupContext();

  const isMember = role === "MEMBER" || role === "CREATOR";
  const { events, loading, actions } = useEvents(id);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <Skeleton />;

  function handleCreated(input: EventFormInput) {
    const newEvent: Event = {
      id: `e${Date.now()}`,
      title: input.title,
      description: input.description,
      date: input.date,
      status: null,
      goingCnt: 0,
      notGoingCnt: 0,
    };

    actions.addEvent(newEvent);
    setShowForm(false);
  }

  return (
    <div className="gd-card">
      <div className="gd-card__header">
        <h2 className="gd-card__title">Events</h2>
        {isMember && (
          <button
            type="button"
            className="gd-btn"
            onClick={() => setShowForm(true)}
          >
            + Create Event
          </button>
        )}
      </div>

      <div className="gd-card__body">
        {!events || events.length === 0 ? (
          <div className="gd-empty">No events yet.</div>
        ) : (
          <div className="gd-events">
            {events.map((event) => (
              <div key={event.id} className="gd-event">
                <div className="gd-event__body">
                  <h3 className="gd-event__title">{event.title}</h3>
                  <p className="gd-event__description">{event.description}</p>
                  <span className="gd-date">{event.date}</span>
                </div>

                <div className="gd-event__side">
                  <div className="gd-event__counts">
                    <span className="gd-event__count gd-event__count--going">
                      ✓ {event.goingCnt} going
                    </span>
                    <span className="gd-event__count gd-event__count--not">
                      ✗ {event.notGoingCnt} not going
                    </span>
                  </div>

                  {isMember && (
                    <div className="gd-event__status">
                      <button
                        type="button"
                        className={`gd-status ${
                          event.status === "GOING"
                            ? "gd-status--active-going"
                            : ""
                        }`}
                        onClick={() =>
                          actions.setEventStatus(event.id, "GOING")
                        }
                      >
                        Going
                      </button>
                      <button
                        type="button"
                        className={`gd-status ${
                          event.status === "NOT_GOING"
                            ? "gd-status--active-not"
                            : ""
                        }`}
                        onClick={() =>
                          actions.setEventStatus(event.id, "NOT_GOING")
                        }
                      >
                        Not Going
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <EventFormModal
          groupId={id}
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

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

        <div className="gd-event__rsvp">
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
  );
}
