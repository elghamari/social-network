import { URLSearchParams } from "url";
import clientAPI from "./clientAPI";
import { redirect } from "next/navigation";

export type State = {
  title?: string;
  description?: string;
};

export async function createGroup(prevState: State, formData: FormData) {
  const data = {
    title: formData.get("title") || "",
    description: formData.get("description") || "",
  };

  if (!data) {
    return {
      title: "Title cannot be empty and must be between 3 and 100 letters.",
      description:
        "Description cannot be empty and must be between 10 and 500 letters.",
    };
  }

  const resp = await clientAPI.post("/groups/create", data);
  switch (resp.status) {
    case 401:
      redirect("/login");
    case 500:
      throw new Error("Internal Server Error");

    case 400:
      
  }
}
