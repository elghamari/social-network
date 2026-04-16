"use server";

import clientAPI from "./client";

import { State, Tab } from "../types/groups";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateGroup } from "../utils/validators";
import { showToast } from "@/app/ui/layout/toast-store";

export async function createGroup(
  prevState: State,
  fd: FormData,
): Promise<State> {
  //
  const data = {
    title: String(fd.get("title") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
  };

  const errors = validateGroup(data);
  if (errors)
    return {
      success: false,
      errors: errors,
      values: data,
    };

  const resp = await clientAPI.post("/groups", data);
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

export async function createJoinRequest(groupId: string) {
  const resp = await clientAPI.post(`/groups/join`, {
    groupId: groupId,
  });

  switch (resp.status) {
    case 401:
      redirect("/login");

    case 400:
      const [key, value] = Object.entries(resp.fields ?? {})[0];
      return {
        success: false,
        errors: { [key]: value },
      };

    case 500:
      throw new Error("Internal Server Error");
  }

  revalidatePath("/groups");
}

export async function deleteJoinRequest(groupId: string) {
  const params = new URLSearchParams({
    groupId: groupId,
  });

  const resp = await clientAPI.delete(`/groups/join?${params.toString()}`);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 200:
      revalidatePath("/groups");
      return;

    case 400:
      (Object.values(resp.fields ?? {}) as string[]).forEach((msg) => {
        showToast(msg);
      });
      return;
  }

  throw new Error("Internal Server Error");
}
