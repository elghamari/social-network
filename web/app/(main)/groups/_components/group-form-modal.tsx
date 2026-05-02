"use client";

import { useState } from "react";

import GroupFormField from "./group-form-field";
import GroupFormImageUpload from "./group-form-image-upload";

import { XCancelIcon } from "@/app/ui/icons";

import { validateGroup } from "@/app/lib/utils/validate";
import { createGroup } from "@/app/lib/services/group";
import type {
  Group,
  GroupFormErrors,
  GroupFormInput,
} from "@/app/lib/types/group";

interface Props {
  onClose: () => void;
  onCreated: (group: Group) => void;
}

export default function GroupFormModal({ onClose, onCreated }: Props) {
  const [errors, setErrors] = useState<GroupFormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const fd = new FormData(form);
    const data: GroupFormInput = {
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      coverImage: fd.get("coverImage") as File | null,
    };

    const validationErrors = validateGroup(data);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const resp = await createGroup(fd);
    setLoading(false);

    if (!resp) return;

    if (resp.fields) {
      setErrors(resp.fields);
      return;
    }

    if (resp.group) {
      onCreated(resp.group);
    }
  }

  function handleOverlayPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    onClose();
  }

  return (
    <div className="gf-overlay" onPointerDown={handleOverlayPointerDown}>
      <div className="gf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gf-modal__header">
          <h2 className="gf-modal__title">Create Group</h2>
          <button type="button" className="gf-modal__close" onClick={onClose}>
            <XCancelIcon size={20} />
          </button>
        </div>

        <form className="gf-modal__form" onSubmit={handleSubmit}>
          <GroupFormField label="Title" errors={errors?.title}>
            <input
              id="title"
              type="text"
              name="title"
              className={`gf-modal__input ${errors?.title?.length ? "gf-modal__input--error" : ""}`}
              placeholder="Enter group title"
              onChange={() => setErrors({ ...errors, title: [] })}
            />
          </GroupFormField>

          <GroupFormField label="Description" errors={errors?.description}>
            <textarea
              id="description"
              name="description"
              className={`gf-modal__input gf-modal__textarea ${errors?.description?.length ? "gf-modal__input--error" : ""}`}
              placeholder="What is this group about?"
              onChange={() => setErrors({ ...errors, description: [] })}
            />
          </GroupFormField>

          <GroupFormImageUpload errors={errors?.coverImage} />

          <div className="gf-modal__actions">
            <button
              type="button"
              className="gf-modal__btn gf-modal__btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gf-modal__btn gf-modal__btn--submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="gf-modal__spinner" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
