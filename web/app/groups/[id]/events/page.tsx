import "./page.css";

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
  {
    id: "e3",
    title: "Typography Deep Dive",
    description:
      "A session focused on type systems, pairing strategies, and vertical rhythm.",
    eventTime: "May 02, 2026 — 5:00 PM",
    rsvp: "NOT_GOING",
    goingCount: 9,
    notGoingCount: 6,
  },
];

const IS_MEMBER = true;

export default function EventsPage() {
  if (!IS_MEMBER) {
    return (
      <div className="gd-locked">
        <p className="gd-locked__title">Members only</p>
        <p className="gd-locked__text">
          Join this group to view and respond to events.
        </p>
      </div>
    );
  }

  if (MOCK_EVENTS.length === 0) {
    return <div className="gd-empty">No events yet.</div>;
  }

  return (
    <div className="gd-events">
      {MOCK_EVENTS.map((event) => (
        <div key={event.id} className="gd-event">
          <div className="gd-event__body">
            <h3 className="gd-event__title">{event.title}</h3>
            <p className="gd-event__description">{event.description}</p>
            <span className="gd-event__time">{event.eventTime}</span>
          </div>

          <div className="gd-event__side">
            <div className="gd-event__counts">
              <span className="gd-event__count gd-event__count--going">
                ✓ {event.goingCount} going
              </span>
              <span className="gd-event__count gd-event__count--not">
                ✗ {event.notGoingCount}
              </span>
            </div>

            <div className="gd-event__rsvp">
              <button
                className={`gd-rsvp ${
                  event.rsvp === "GOING" ? "gd-rsvp--active-going" : ""
                }`}
              >
                Going
              </button>
              <button
                className={`gd-rsvp ${
                  event.rsvp === "NOT_GOING" ? "gd-rsvp--active-not" : ""
                }`}
              >
                Not Going
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
