import client from "./client";

export async function GetFeedPosts():Promise<any> {
return await client.get("/posts/feed")
}

export async function CreatePost(data: any):Promise<any> {
return await client.postForm("/posts/create", data)
}