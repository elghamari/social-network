<<<<<<< HEAD
import client from "./client";
=======
import client from "./_client";
>>>>>>> origin/feed

export const GetFeedPosts = async (cursor: number = 0) => {
  return await client.get(`/posts/feed?cursor=${cursor}`);
};

export async function CreatePost(data: any) {
return await client.postForm("/posts/create", data)
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
