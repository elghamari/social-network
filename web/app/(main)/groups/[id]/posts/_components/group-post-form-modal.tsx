"use client";

import { useState } from "react";

// import { createGroupPost } from "@/app/lib/services/group";
import { XCancelIcon } from "@/app/ui/icons";

import type { PostType } from "@/app/lib/types/feed";

type Props = {
  groupId: string;
  onClose: () => void;
  onCreated: (post: PostType) => void;
};

export default function GroupPostFormModal({
  groupId,
  onClose,
  onCreated,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // e.preventDefault();
    // const form = e.currentTarget;
    // const fd = new FormData(form);

    // setLoading(true);
    // const resp = await createGroup(groupId, fd);
    // setLoading(false);

    // if (!resp) return;

    // if (resp.post) {
    //   onCreated(resp.post);
    // }
  }

  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gp-modal__header">
          <h2 className="gp-modal__title">Create Post</h2>
          <button type="button" className="gp-modal__close" onClick={onClose}>
            <XCancelIcon size={20} />
          </button>
        </div>

        <form className="gp-modal__form" onSubmit={handleSubmit}>
          <input
            name="title"
            className="gp-modal__input"
            type="text"
            placeholder="Post title (optional)"
          />

          <textarea
            name="content"
            className="gp-modal__input gp-modal__textarea"
            placeholder="What's on your mind?"
            rows={4}
            required
          />

          <input
            name="image"
            className="gp-modal__file"
            type="file"
            accept="image/*"
          />

          <div className="gp-modal__actions">
            <button
              type="button"
              className="gp-modal__btn gp-modal__btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gp-modal__btn gp-modal__btn--submit"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
