"use server";

import clientAPI from "./clientApi";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FormData, FormErrors } from "./types/groups";

export async function createGroup(data: FormData) {
  const errors: FormErrors = {};

  const title = data.title;
  if (!title || !(title.length >= 3 && title.length <= 100)) {
    errors.title =
      "Title cannot be empty and must be between 3 and 100 letters.";
  }

  const description = data.description;
  if (
    !description ||
    !(description.length >= 10 && description.length <= 500)
  ) {
    errors.description =
      "Description cannot be empty and must be between 10 and 500 letters.";
  }

  console.log(data, errors);

  if (Object.keys(errors).length !== 0) return errors;

  const resp = await clientAPI.post("/groups/create", data);
  switch (resp.status) {
    case 401:
      redirect("/login");

    case 500:
      throw new Error("Internal Server Error");

    case 400:
      return resp.fields;
  }

  revalidatePath("/groups");
  redirect("/groups");
}
