"use client";

import { ImageIcon, XCancelIcon } from "@/app/ui/icons";
import { useRef, useState } from "react";

export default function GroupFormImageUpload({
  errors,
}: {
  errors?: string[];
}) {
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  return (
    <div className="gf-modal__field">
      <label className="gf-modal__label">Cover Image (optional)</label>
      <div
        className={`gf-modal__upload ${imagePreview ? "gf-modal__upload--has-image" : ""}`}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <div className="gf-modal__upload-preview">
            <img src={imagePreview} alt="Cover preview" />
            <button
              type="button"
              className="gf-modal__upload-remove"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (fileInputRef.current) fileInputRef.current.value = "";
                setImagePreview("");
              }}
              aria-label="Remove image"
            >
              <XCancelIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="gf-modal__upload-placeholder">
            <ImageIcon size={25} />
            <span>Click to upload</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          name="coverImage"
          onChange={handleImageUpload}
          aria-label="Upload cover image"
        />
      </div>
      {errors &&
        errors.length > 0 &&
        errors.map((err, i) => (
          <span key={i} className="gf-modal__error">
            {err}
          </span>
        ))}
    </div>
  );
}
