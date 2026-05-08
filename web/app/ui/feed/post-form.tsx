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
import { ImageIcon } from "../icons";

export default function PostForm({ onCancel, onPostCreated, inGroup, groupId }: PostFormProps) {
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

      if (formErrors?.private && newprivateUsers.length > 0) {
        setFormErrors({ ...formErrors, private: undefined });
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
        const specificErrorMessage = Object.values(errors)[0] as string;
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

    const formData = new FormData();
    formData.append("title", inputForm.title);
    formData.append("description", inputForm.description);
    formData.append("privacy", inputForm.privacy);
    if (inGroup) {
      formData.append("groupId", groupId || "");
    }

    if (inputForm.image) {
      formData.append("image", inputForm.image);
    }

    if (inputForm.privacy === "private") {
      inputForm.privateUsers.forEach((userId) => {
        formData.append("privateUsers", userId);
      });
    }

    console.log("### Form Data >>>>>>>>>>>>>>> ", formData);

    try {
      const response = await CreatePost(formData);

      console.log("====== Reasponse >>>>> ", response);

      if (response) {
        if (response.fields) {
          const backendErrors: any = {};
          Object.keys(response.fields).forEach((key) => {
            // backendErrors[key] = response.fields[key][0];
            if (key === "coverImage" || key === "image") {
              backendErrors[key] = response.fields[key]; 
            } else {
              backendErrors[key] = response.fields[key][0];
            }
          });
          setFormErrors(backendErrors);
          return;
        }

        console.log("Post created successfully:");
        onCancel();
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.log("Network error creating post: ", error);
      showToast("Network error. Please check your connection.");
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
        {formErrors?.title && <p className="error-text">{formErrors.title}</p>}
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
        {formErrors?.description && <p className="error-text">{formErrors.description}</p>}
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
            className={formErrors?.private || formErrors?.duplicate ? "input-error" : ""}
            style={{ borderRadius: "12px" }}
          >
            <PrivateSection
              users={user?.user?.following || []}
              privateUsers={inputForm.privateUsers}
              toggleUser={toggleUser}
            />
            {(formErrors?.private || formErrors?.duplicate) && (<p className="error-text">{formErrors.private}</p>)}
          </div>
        )}

        {
          (formErrors?.coverImage && Array.isArray(formErrors.coverImage)) && (
            <div className="image-errors-list">
              {formErrors.coverImage.map((el: string, index: number) => (
                <p key={index} className="error-text"> {el} </p>
              ))}
            </div>
          )
        }

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
                <ImageIcon size={20} />
                <span>Image</span>
              </button>
            </div>
            {!inGroup &&(
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
            )}

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
