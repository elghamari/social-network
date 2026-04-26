"use client";

import { useActionState, useEffect } from "react";

import { createGroup } from "@/app/lib/services/groups";
import { State } from "@/app/lib/types/groups";
import SubmitBtn from "./submit-btn";
import { useRouter } from "next/navigation";

export default function Form() {
  const router = useRouter();

  const initialState: State = { success: false };
  const [state, formAction] = useActionState(createGroup, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/groups");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="group-form">
      <div className="group-form__field">
        <label htmlFor="title" className="group-form__label">
          Title
        </label>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={state.values?.title ?? ""}
          className={`group-form__input ${state.errors?.title ? "group-form__input--error" : ""}`}
          placeholder="Enter group title"
        />
        {state.errors?.title && (
          <span className="group-form__error">{state.errors?.title}</span>
        )}
      </div>

      <div className="group-form__field">
        <label htmlFor="description" className="group-form__label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={state.values?.description ?? ""}
          className={`group-form__input group-form__textarea ${state.errors?.description ? "group-form__input--error" : ""}`}
          placeholder="What is this group about?"
        />
        {state.errors?.description && (
          <span className="group-form__error">{state.errors?.description}</span>
        )}
      </div>

      {state.errors?.general && (
        <div className="group-form__general-error">{state.errors.general}</div>
      )}

      <div className="group-form__actions">
        <button
          type="button"
          className="group-form__btn group-form__btn--cancel"
          onClick={() => {
            router.push("/groups");
          }}
        >
          Cancel
        </button>
        <SubmitBtn />
      </div>
    </form>
  );
}

// const fileInputRef = useRef<HTMLInputElement>(null);

// const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setFormData((prev) => ({
//         ...prev,
//         coverImage: reader.result as string,
//       }));
//     };
//     reader.readAsDataURL(file);
//   }
// };

// const handleRemoveImage = (e: React.MouseEvent) => {
//   e.stopPropagation();
//   setFormData((prev) => ({ ...prev, coverImage: "" }));
//   if (fileInputRef.current) {
//     fileInputRef.current.value = "";
//   }
// };

// const validate = (): boolean => {
//   const newErrors: FormErrors = {};

//   if (!formData.title.trim()) {
//     newErrors.title = "Title is required";
//   }

//   if (!formData.description.trim()) {
//     newErrors.description = "Description is required";
//   }

//   setErrors(newErrors);
//   return Object.keys(newErrors).length === 0;
// };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!validate()) return;

//   setIsSubmitting(true);

//   try {
//     // TODO: Replace with actual API call
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     console.log("Creating group:", formData);
//     router.push("/groups");
//   } catch (error) {
//     console.log("Failed to create group:", error);
//   } finally {
//     setIsSubmitting(false);
//   }
// };

{
  /* <div className="group-form__field">
        <label className="group-form__label">Cover Image (optional)</label>
        <div
          className={`group-form__upload ${state.coverImage ? "group-form__upload--has-image" : ""}`}
          onClick={() => !state.coverImage && fileInputRef.current?.click()}
        >
          {state.coverImage ? (
            <div className="group-form__upload-preview">
              <img src={state.coverImage} alt="Cover preview" />
              <button
                type="button"
                className="group-form__upload-remove"
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="group-form__upload-placeholder">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Click to upload</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            aria-label="Upload cover image"
          />
        </div>
      </div> */
}
