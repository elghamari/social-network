import { log } from "node:console";
import client from "./_client";

export const GetFeedPosts = async (cursor: number = 0) => {
  return await client.get(`/posts/feed?cursor=${cursor}`);
};

export async function CreatePost(data: any) {
  const groupId = data.get("groupId")
  const url = groupId
    ? `/groups/${groupId}/posts`
    : `/posts/create`;

return await client.postForm(url, data)
}

export const ToggleLikePost = async (postId: number) => {
  return await client.post(`/reactions/toggle?postId=${postId}`, {}); 
};

export const GetPostComments = async (postId: number, cursor: number = 0) => {
  return await client.get(`/comments?postId=${postId}&cursor=${cursor}`);
};  

export async function CreateComment(data: any) {
return await client.postForm(`/comments/create?postId=${data.get("postId")}`, data)
}

export async function GetGroupPosts(cursor: number = 0, groupId: string) {
  return await client.get(`/groups/${groupId}/posts?cursor=${cursor}`);
}