"use server";

import clientAPI from "./client";

import { State, Tab } from "../types/groups";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateGroup } from "../utils/validators";
import { showToast } from "@/app/ui/layout/toast-store";

export async function createGroup(prevState: State, fd: FormData) {
  const data = {
    title: String(fd.get("title")) || "",
    description: String(fd.get("description")) || "",
  };

  const state = validateGroup(data);
  if (state) return state;

  const resp = await clientAPI.post("/groups/create", data);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 500:
      throw new Error("Internal Server Error");

    case 400:
      return resp.fields;
  }

  await new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, 5000);
  });

  revalidatePath("/groups");
  redirect("/groups");
}

export async function fetchGroups(activeTab: Tab, query: string) {
  const params = new URLSearchParams({
    tab: activeTab,
    query: query,
  });

  const resp = await clientAPI.get(`/groups?${params.toString()}`);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 200:
      return resp.groups;
  }

  throw new Error("Internal Server Error");
}

export async function createJoinRequest(groupId: string) {
  const resp = await clientAPI.post(`/groups/join`, {});
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
      resp.fields?.forEach((field: string) => {
        showToast(field);
      });
      return;
  }

  throw new Error("Internal Server Error");
}
