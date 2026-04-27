import { PostType } from "../types/feed";
import client from "./client";

export const GetFeedPosts = async (cursor: number = 0) => {
  return await client.get(`/posts/feed?cursor=${cursor}`);
};

export async function CreatePost(data: any):Promise<any> {
return await client.postForm("/posts/create", data)
}

export const ToggleLikePost = async (postId: number) => {
  return await client.post(`/reactions/toggle?postId=${postId}`, {}); 
};