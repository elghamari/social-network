// app/ui/auth/register-form-avatar-upload.tsx
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
    <div className="auth-field">
      <label className="auth-label">Profile Avatar</label>

      <div
        className={`auth-upload ${preview ? "auth-upload--has-image" : ""} ${hasError ? "auth-upload--error" : ""}`}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="auth-upload-preview">
            <img src={preview} alt="Avatar preview" />
            <button
              type="button"
              className="auth-upload-remove"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <XCancelIcon size={14} />
            </button>
          </div>
        ) : (
          <div className="auth-upload-placeholder">
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
        <div className="auth-field-errors">
          {errors!.map((msg, i) => (
            <span key={i} className="auth-field-error">
              {msg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
