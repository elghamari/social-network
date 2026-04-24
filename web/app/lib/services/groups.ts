import clientAPI from "./_client";

import { Tab } from "@/app/lib/types/groups";

export async function createGroup(fd: FormData) {
  return await clientAPI.postForm("/groups", fd);
}

export async function listGroups(activeTab: Tab, query: string) {
  const params = new URLSearchParams({
    tab: activeTab,
    query: query,
  });

  return await clientAPI.get(`/groups?${params.toString()}`);
}

export async function createJoinRequest(groupId: string) {
  return await clientAPI.post(`/groups/join`, {
    groupId: groupId,
  });
}

export async function deleteJoinRequest(groupId: string) {
  const params = new URLSearchParams({
    groupId: groupId,
  });
  return await clientAPI.delete(`/groups/join?${params.toString()}`);
}

export async function getGroupById(id: string) {
  console.log(`The id < ${id} >`);

  return await clientAPI.get(`/groups/${id}`);
}
