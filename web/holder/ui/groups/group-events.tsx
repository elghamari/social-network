import Link from "next/link";
import { PlusIcon } from "@/app/ui/icons";

type RSVPStatus = "GOING" | "NOT_GOING" | null;

const MOCK_EVENTS: {
  id: string;
  title: string;
  description: string;
  eventTime: string;
  rsvp: RSVPStatus;
  goingCount: number;
  notGoingCount: number;
}[] = [
  {
    id: "e1",
    title: "Weekly Design Critique",
    description:
      "Bring one screen and get fast, useful feedback from the group.",
    eventTime: "Apr 24, 2026 — 7:00 PM",
    rsvp: "GOING",
    goingCount: 14,
    notGoingCount: 3,
  },
  {
    id: "e2",
    title: "Figma Jam Session",
    description:
      "Collaborative ideation around social app UX. Explore layout patterns together.",
    eventTime: "Apr 28, 2026 — 6:30 PM",
    rsvp: null,
    goingCount: 7,
    notGoingCount: 1,
  },
];

export default function GroupEvents({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  return (
    <div className="gp-section">
      <div className="gp-section__header">
        <h2 className="gp-section__title">Events</h2>

        {isMember && (
          <Link href={`/groups/${groupId}/events/create`} className="gp-btn">
            <PlusIcon />
            New Event
          </Link>
        )}
      </div>

      <div className="gp-section__body">
        {!isMember ? (
          <div className="gp-locked">
            <p className="gp-locked__title">Members only</p>
            <p className="gp-locked__text">
              Join this group to view and respond to events.
            </p>
          </div>
        ) : MOCK_EVENTS.length === 0 ? (
          <div className="gp-empty">No events yet.</div>
        ) : (
          <div className="gp-events">
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="gp-event">
                <div className="gp-event__left">
                  <h3 className="gp-event__title">{event.title}</h3>
                  <p className="gp-event__description">{event.description}</p>
                  <span className="gp-event__time">{event.eventTime}</span>
                </div>

                <div className="gp-event__right">
                  <div className="gp-event__counts">
                    <span className="gp-event__count gp-event__count--going">
                      ✓ {event.goingCount} going
                    </span>
                    <span className="gp-event__count gp-event__count--not">
                      ✗ {event.notGoingCount} not going
                    </span>
                  </div>

                  <div className="gp-event__rsvp">
                    <button
                      className={`gp-rsvp ${
                        event.rsvp === "GOING" ? "gp-rsvp--active-going" : ""
                      }`}
                    >
                      Going
                    </button>
                    <button
                      className={`gp-rsvp ${
                        event.rsvp === "NOT_GOING" ? "gp-rsvp--active-not" : ""
                      }`}
                    >
                      Can&apos;t go
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
