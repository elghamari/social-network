"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { createGroup } from "@/app/lib/services/groups";
import { GroupState } from "@/app/lib/types/groups";
import { ImageIcon, XCancelIcon } from "@/app/ui/icons";

import GroupFormActions from "./group-form-actions";
import GroupImageUpload from "./form-image-upload";
import GroupFormField from "./group-form-field";

export default function GroupForm() {
  const router = useRouter();

  const initialState: GroupState = { success: false };
  const [state, formAction] = useActionState(createGroup, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/groups");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="group-form">
      <GroupFormField label="Title" error={state.errors?.title}>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={state.values?.title ?? ""}
          className={`group-form__input ${state.errors?.title ? "group-form__input--error" : ""}`}
          placeholder="Enter group title"
        />
      </GroupFormField>

      <GroupFormField label="Description" error={state.errors?.description}>
        <textarea
          id="description"
          name="description"
          defaultValue={state.values?.description ?? ""}
          className={`group-form__input group-form__textarea ${state.errors?.description ? "group-form__input--error" : ""}`}
          placeholder="What is this group about?"
        />
      </GroupFormField>

      <GroupImageUpload error={state.errors?.coverImage ?? ""} />

      <GroupFormActions />
    </form>
  );
}
