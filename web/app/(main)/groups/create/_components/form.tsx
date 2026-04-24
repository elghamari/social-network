"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GroupData, GroupErrors } from "@/app/lib/types/groups";
import { validateGroup } from "@/app/lib/utils/validators";
import { createGroup } from "@/app/lib/services/groups";

import FormField from "./form-field";
import FormImageUpload from "./form-image-upload";
import FormActions from "./form-actions";

export default function Form() {
  const router = useRouter();

  const [errors, setErrors] = useState<GroupErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const form = e.target;

    const fd = new FormData(form);
    const data: GroupData = {
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
    switch (resp.status) {
      case 401:
        router.push("/login");
        break;

      case 400:
        setErrors(resp.fields);
        break;

      case 500:
        throw new Error("Internal Server Error");

      default:
        router.push("/groups");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="group-form">
      <FormField label="Title" error={errors?.title}>
        <input
          id="title"
          type="text"
          name="title"
          className={`group-form__input ${errors?.title ? "group-form__input--error" : ""}`}
          placeholder="Enter group title"
          onChange={() => {
            setErrors({ ...errors, title: "" });
          }}
        />
      </FormField>

      <FormField label="Description" error={errors?.description}>
        <textarea
          id="description"
          name="description"
          className={`group-form__input group-form__textarea ${errors?.description ? "group-form__input--error" : ""}`}
          placeholder="What is this group about?"
          onChange={() => {
            setErrors({ ...errors, description: "" });
          }}
        />
      </FormField>

      <FormImageUpload error={errors?.coverImage ?? ""} />

      <FormActions loading={loading} />
    </form>
  );
}
