("use server");

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import clientAPI from "./client";
import { State, Tab } from "../types/groups";
import { validateGroup } from "../utils/validators";

class groupService {
  async createGroup(prevState: State, fd: FormData) {
    const data = {
      title: String(fd.get("title")) || "",
      description: String(fd.get("description")) || "",
    };

    const state = validateGroup(data);
    if (state) {
      return state;
    }

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

  async fetchGroups(activeTab: Tab, query: string) {
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

      case 400:
        return resp.fields;
    }
  }
}

export default new groupService();
