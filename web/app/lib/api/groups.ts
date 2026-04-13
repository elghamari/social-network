import { URLSearchParams } from "node:url";
import clientApi from "./client";

export async function getAllGroups({ cursorId }: { cursorId: number }) {
  const params = new URLSearchParams();
  params.set("cursor_id", String(cursorId));

  return await clientApi.get(`/groups?${params.toString()}`);
}
