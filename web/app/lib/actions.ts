"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import clientAPI from "./clientApi";

import { State } from "./types/groups";

export async function createGroup(prevState: State, fd: FormData) {
  const state: State = {};

  const data = {
    title: String(fd.get("title")) || "",
    description: String(fd.get("description")) || "",
  };

  const title = data.title;
  if (!title || !(title.length >= 3 && title.length <= 100)) {
    state.title =
      "Title cannot be empty and must be between 3 and 100 letters.";
  }

  const description = data.description;
  if (
    !description ||
    !(description.length >= 10 && description.length <= 500)
  ) {
    state.description =
      "Description cannot be empty and must be between 10 and 500 letters.";
  }

  if (Object.keys(state).length !== 0) return state;

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
