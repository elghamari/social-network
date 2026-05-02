import { useState } from "react";

import { Event, EventResponse } from "@/app/lib/types/group";
import { FormatTime } from "@/app/lib/utils/format-time";
import { respondToEvent } from "@/app/lib/services/group";

type Props = {
  groupId: string;
  event: Event;
  onResponse: (eventId: string, response: EventResponse) => void;
};

export default function EventCard({ groupId, event, onResponse }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRequest = async (response: EventResponse) => {
    setLoading(true);
    const resp = await respondToEvent(groupId, event.id, response);
    setLoading(false);

    if (!resp) return;

    onResponse(event.id, response);
  };

  return (
    <div className="gd-event">
      <div className="gd-event__body">
        <h3 className="gd-event__title">{event.title}</h3>
        <p className="gd-event__description">{event.description}</p>
        <span className="gd-event__date">{FormatTime(event.date)}</span>
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

        <div className="gd-event__response">
          <button
            type="button"
            className={`gd-response ${event.response === "GOING" ? "gd-response--active-going" : ""
              }`} 
            onClick={() => handleRequest("GOING")}
            disabled={loading || event.response === "GOING"}
          >
            Going
          </button>
          <button
            type="button"
            className={`gd-response ${event.response === "NOT_GOING" ? "gd-response--active-not" : ""
              }`}
            onClick={() => handleRequest("NOT_GOING")}
            disabled={loading || event.response === "NOT_GOING"}
          >
            Not Going
          </button>
        </div>
      </div>
    </div>
  );
}
