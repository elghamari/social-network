"use client";

import { createEvent } from "@/app/lib/services/group";
import { EventFormErrors, EventFormInput } from "@/app/lib/types/group";
import { validateEvent } from "@/app/lib/utils/validators";
import { XCancelIcon } from "@/app/ui/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventFormField from "./event-form-field";

interface Props {
  groupId: string;
  onClose: () => void;
  onCreated: (input: EventFormInput) => void;
}

export default function EventFormModal({ groupId, onClose, onCreated }: Props) {
  const router = useRouter();

  const [errors, setErrors] = useState<EventFormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const form = e.target;

    const fd = new FormData(form);
    const data: EventFormInput = {
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      date: String(fd.get("date") ?? "").trim(),
    };

    const validationErrors = validateEvent(data);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const resp = await createEvent(groupId, data);
    setLoading(false);
    switch (resp.status) {
      case 401:
        router.push("/login");
        break;

      case 400:
        console.log(resp.fields);

        setErrors(resp.fields);
        break;

      case 500:
        throw new Error("Internal Server Error");

      default:
        onCreated(data);
    }
  }

  return (
    <div className="ef-overlay" onClick={onClose}>
      <div className="ef-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ef-modal__header">
          <h2 className="ef-modal__title">Create Event</h2>
          <button type="button" className="ef-modal__close" onClick={onClose}>
            <XCancelIcon size={20} />
          </button>
        </div>

        <form className="ef-modal__form" onSubmit={handleSubmit}>
          <EventFormField label="Title" error={errors?.title}>
            <input
              name="title"
              className="ef-field__input"
              type="text"
              placeholder="Event title"
            />
          </EventFormField>

          <EventFormField label="Description" error={errors?.description}>
            <textarea
              name="description"
              className="ef-field__input ef-field__input--textarea"
              placeholder="What's this event about?"
              rows={3}
            />
          </EventFormField>

          <EventFormField label="Date & Time" error={errors?.date}>
            <input
              name="date"
              className="ef-field__input"
              type="datetime-local"
            />
          </EventFormField>

          <div className="ef-modal__actions">
            <button
              type="button"
              className="ef-btn ef-btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ef-btn ef-btn--submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
