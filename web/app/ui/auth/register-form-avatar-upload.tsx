"use client";

import { useRef, useState } from "react";
import { ImageIcon, XCancelIcon } from "@/app/ui/icons";

interface RegisterAvatarUploadProps {
  errors?: string[];
  onError: (errors: string[]) => void;
  onClearError: () => void;
}

export function RegisterAvatarUpload({
  errors,
  onError,
  onClearError,
}: RegisterAvatarUploadProps) {
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError(["Image size must be less than 5MB"]);
      return;
    }

    onClearError();
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview("");
    onClearError();
  };

  const hasError = Boolean(errors?.length);

  return (
    <div className="register-field">
      <label className="register-label">Profile Avatar</label>

      <div
        className={`register-upload ${preview ? "register-upload--has-image" : ""} ${hasError ? "register-upload--error" : ""}`}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="register-upload-preview">
            <img src={preview} alt="Avatar preview" />
            <button
              type="button"
              className="register-upload-remove"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <XCancelIcon size={14} />
            </button>
          </div>
        ) : (
          <div className="register-upload-placeholder">
            <ImageIcon size={24} />
            <span>Click to upload</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          name="avatar"
          onChange={handleImageChange}
          aria-label="Upload avatar"
          hidden
        />
      </div>

      {hasError && (
        <div className="register-field-errors">
          {errors!.map((msg, i) => (
            <span key={i} className="register-field-error">
              {msg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
