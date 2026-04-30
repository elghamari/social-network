import clientAPI from "./_client";

import type {
  EventFormInput,
  EventResponse,
  GroupTab,
} from "@/app/lib/types/group";

export async function createGroup(fd: FormData) {
  return await clientAPI.postForm("/groups", fd);
}

export async function getGroups(activeTab: GroupTab, query: string) {
  const params = new URLSearchParams({
    tab: activeTab,
    query: query,
  });

  return await clientAPI.get(`/groups?${params.toString()}`);
}

export async function submitJoinRequest(groupId: string) {
  return await clientAPI.post(`/groups/join`, {
    groupId: groupId,
  });
}

export async function cancelJoinRequest(groupId: string) {
  const params = new URLSearchParams({
    groupId: groupId,
  });
  return await clientAPI.delete(`/groups/join?${params.toString()}`);
}

export async function getGroup(id: string) {
  return await clientAPI.get(`/groups/${id}`);
}

export async function getInvitableUsers(groupId: string) {
  return await clientAPI.get(`/groups/${groupId}/manage/invite`);
}

export async function submitGroupInvitation(groupId: string, userId: string) {
  return await clientAPI.post(`/groups/${groupId}/manage/invite`, {
    userId: userId,
  });
}

export async function cancelGroupInvitation(groupId: string, userId: string) {
  const params = new URLSearchParams({
    userId: userId,
  });

  return await clientAPI.delete(
    `/groups/${groupId}/manage/invite?${params.toString()}`,
  );
}

export async function listJoinRequests(groupId: string) {
  return await clientAPI.get(`/groups/${groupId}/manage/requests`);
}

export async function approveJoinRequest(groupId: string, userId: string) {
  return await clientAPI.post(`/groups/${groupId}/manage/requests`, {
    userId: userId,
  });
}

export async function rejectJoinRequest(groupId: string, userId: string) {
  const params = new URLSearchParams({
    userId: userId,
  });
  return await clientAPI.delete(
    `/groups/${groupId}/manage/requests?${params.toString()}`,
  );
}

export async function createEvent(groupId: string, data: EventFormInput) {
  return await clientAPI.post(`/groups/${groupId}/events`, data);
}

export async function getEvents(groupId: string) {
  return await clientAPI.get(`/groups/${groupId}/events`);
}

export async function respondToEvent(
  groupId: string,
  eventId: string,
  response: EventResponse,
) {
  return await clientAPI.put(`/groups/${groupId}/events`, {
    eventId: eventId,
    response: response,
  });
}
