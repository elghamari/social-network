"use client";
import { useState, useRef } from "react";
import "./posts.css";
import PrivateSection from "./private-section";
import { useAuth } from "@/app/_context/AuthContext";
import { CreatePost } from "@/app/lib/services/feed";
import {
  CreatePostFormProps,
  FormState,
  PostErrors,
  PostFormProps,
} from "@/app/lib/types/feed";
import { validatePostForm } from "@/app/lib/utils/validate";
import { showToast } from "../layout/toast-store";

export default function PostForm({ onCancel, onPostCreated }: PostFormProps) {
  const [inputForm, setInputForm] = useState<FormState>({
    title: "",
    description: "",
    privacy: "public",
    image: null,
    privateUsers: [],
  });

  const [preview, setPreview] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<PostErrors | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setInputForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleUser = (userId: string) => {
    setInputForm((prev) => {
      const isSelected = prev.privateUsers.includes(userId);

      const newprivateUsers = isSelected
        ? prev.privateUsers.filter((id) => id !== userId)
        : [...prev.privateUsers, userId];

      if (formErrors?.privateUsers && newprivateUsers.length > 0) {
        setFormErrors({ ...formErrors, privateUsers: undefined });
      }

      return { ...prev, privateUsers: newprivateUsers };
    });
  };

  const handleSubmit = async () => {
    const errors = validatePostForm(inputForm);
    if (errors) {
      setFormErrors(errors);
      const errorKeys = Object.keys(errors);
      if (errorKeys.length === 1) {
        const specificErrorMessage = Object.values(errors)[0];
        console.log("TOAST ERROR: ", specificErrorMessage);
        showToast(specificErrorMessage);
      } else {
        const errorMessage = "Please fix the highlighted fields.";
        console.log("TOAST ERROR: ", errorMessage);
        showToast(errorMessage);
      }

      return;
    }
    setFormErrors(null);

    try {
      const formData = new FormData();
      formData.append("title", inputForm.title);
      formData.append("description", inputForm.description);
      formData.append("privacy", inputForm.privacy);

      if (inputForm.image) {
        formData.append("image", inputForm.image);
      }

      if (inputForm.privacy === "private") {
        inputForm.privateUsers.forEach((userId) => {
          formData.append("privateUsers", userId);
        });
      }

      const response = await CreatePost(formData);

      if (response.status === 201) {
        onCancel();
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        showToast("Failed to create post, try again.");
      }
    } catch (error) {
      showToast("Something went wrong!, try again.");
    }
  };

  const user = useAuth();

  return (
    <div className="create-form-wrapper">
      <div className="create-form-container">
        <input
          type="text"
          className={`create-post-title ${formErrors?.title ? "input-error" : ""}`}
          placeholder="Post title..."
          value={inputForm.title}
          onChange={(e) => {
            setInputForm((prev) => ({ ...prev, title: e.target.value }));
            if (formErrors?.title)
              setFormErrors({ ...formErrors, title: undefined });
          }}
        />

        <textarea
          className={`create-post-area ${formErrors?.description ? "input-error" : ""}`}
          placeholder="What's on your mind?"
          value={inputForm.description}
          onChange={(e) => {
            setInputForm((prev) => ({ ...prev, description: e.target.value }));
            if (formErrors?.description)
              setFormErrors({ ...formErrors, description: undefined });
          }}
        ></textarea>

        {preview && (
          <div className="image-preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button className="remove-image-btn" onClick={removeImage}>
              ✕
            </button>
          </div>
        )}

        {inputForm.privacy === "private" && (
          <div
            className={formErrors?.privateUsers ? "input-error" : ""}
            style={{ borderRadius: "12px" }}
          >
            <PrivateSection
              users={user?.user?.following || []}
              privateUsers={inputForm.privateUsers}
              toggleUser={toggleUser}
            />
          </div>
        )}

        <div className="create-post-footer">
          <div className="create-post-actions">
            <div className="create-post-tools">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="tool-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Image</span>
              </button>
            </div>
            <div className="privacy-control">
              <select
                className={`create-post-privacy ${formErrors?.privacy ? "input-error" : ""}`}
                value={inputForm.privacy}
                onChange={(e) =>
                  setInputForm((prev) => ({ ...prev, privacy: e.target.value }))
                }
              >
                <option value="public">Public</option>
                <option value="almost private">
                  Almost Private (Followers only)
                </option>
                <option value="private">Private (Selected followers)</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-post-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
