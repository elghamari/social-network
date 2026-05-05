import clientAPI from "./_client";

import { sleep } from "../utils/utils";

import type {
  EventFormInput,
  EventResponse,
  GroupTab,
} from "@/app/lib/types/group";

export async function createGroup(fd: FormData) {
  return await clientAPI.postForm("/groups", fd);
}

export async function getGroups(tab: GroupTab, query: string, cursor: string) {
  const params = new URLSearchParams({
    tab: tab,
    query: query,
    cursor: cursor,
  });

  await sleep();
  return await clientAPI.get(`/groups?${params.toString()}`);
}

export async function getGroup(id: string) {
  return await clientAPI.get(`/groups/${id}`);
}

export async function getGroupPosts(groupId: string) {
  return await clientAPI.get(`/groups/${groupId}/posts`);
}

export async function createGroupPost(groupId: string) {
  return await clientAPI.get(`/groups/${groupId}/posts`);
}

export async function getInvitableUsers(
  groupId: string,
  query: string,
  cursor: string,
) {
  const params = new URLSearchParams({
    query: query,
    cursor: cursor,
  });

  await sleep();
  return await clientAPI.get(
    `/groups/${groupId}/manage/invite?${params.toString()}`,
  );
}

export async function sendGroupInvitation(groupId: string, userId: string) {
  return await clientAPI.post(`/groups/${groupId}/manage/invite`, {
    userId: userId,
  });
}

export async function revokeGroupInvitation(groupId: string, userId: string) {
  const params = new URLSearchParams({
    userId: userId,
  });

  return await clientAPI.delete(
    `/groups/${groupId}/manage/invite?${params.toString()}`,
  );
}

export async function acceptGroupInvitation(groupId: string) {
  return await clientAPI.put(`/groups/${groupId}/manage/invitations`, {});
}

export async function declineGroupInvitation(groupId: string) {
  return await clientAPI.delete(`/groups/${groupId}/manage/requests`);
}

export async function getJoinRequests(groupId: string, cursor: string) {
  const params = new URLSearchParams({
    cursor: cursor,
  });

  await sleep();
  return await clientAPI.get(
    `/groups/${groupId}/manage/requests?${params.toString()}`,
  );
}

export async function sendJoinRequest(groupId: string) {
  return await clientAPI.post(`/groups/${groupId}/requests`, {});
}

export async function revokeJoinRequest(groupId: string) {
  return await clientAPI.delete(`/groups/${groupId}/requests`);
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

export async function getEvents(groupId: string, cursor: string) {
  const params = new URLSearchParams({
    cursor: cursor,
  });

  await sleep();
  return await clientAPI.get(`/groups/${groupId}/events?${params.toString()}`);
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
