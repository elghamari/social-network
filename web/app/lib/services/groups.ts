"use server";

import clientAPI from "./client";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Tab, GroupState, ActionResult } from "@/app/lib/types/groups";
import { validateGroup } from "@/app/lib/utils/validators";

export async function createGroup(
  prevState: GroupState,
  fd: FormData,
): Promise<GroupState> {
  //
  const file = fd.get("coverImage");

  const data = {
    title: String(fd.get("title") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    coverImage: file instanceof File ? file : null,
  };

  const errors = validateGroup(data);
  if (errors) {
    return {
      success: false,
      errors: errors,
      values: data,
    };
  }

  const payload = new FormData();
  payload.append("title", data.title);
  payload.append("description", data.description);
  if (data.coverImage) {
    payload.append("coverImage", data.coverImage);
  }

  const resp = await clientAPI.postForm("/groups", payload);
  console.log(resp);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 400:
      return {
        success: false,
        errors: resp.fields,
        values: data,
      };

    case 500:
      throw new Error("Internal Server Error");
  }

  revalidatePath("/groups");
  return { success: true };
}

export async function listGroups(activeTab: Tab, query: string) {
  const params = new URLSearchParams({
    tab: activeTab,
    query: query,
  });

  const resp = await clientAPI.get(`/groups?${params.toString()}`);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 500:
      throw new Error("Internal Server Error");
  }

  return resp.groups;
}

export async function createJoinRequest(
  groupId: string,
): Promise<ActionResult> {
  const resp = await clientAPI.post(`/groups/join`, {
    groupId: groupId,
  });

  switch (resp.status) {
    case 401:
      redirect("/login");

    case 400:
      return {
        success: false,
        error: resp.error,
      };

    case 500:
      throw new Error("Internal Server Error");
  }

  revalidatePath("/groups");
  return { success: true };
}

export async function deleteJoinRequest(
  groupId: string,
): Promise<ActionResult> {
  const params = new URLSearchParams({
    groupId: groupId,
  });

  const resp = await clientAPI.delete(`/groups/join?${params.toString()}`);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 400:
      return { success: false, error: resp.error };

    case 500:
      throw new Error("Internal Server Error");
  }

  revalidatePath("/groups");
  return { success: true };
}

export async function getGroupById(groupId: string) {
  const params = new URLSearchParams({
    groupId: groupId
  });
  
  clientAPI.get(`/groups`)
}
