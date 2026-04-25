"use client";
import CreatePostForm from "@/app/ui/posts/create-form";
import {GetFeedPosts} from "../lib/services/feed";
import { useEffect } from "react";
import PostList from "../ui/posts/post-list";

export default  function HomePage() {

  useEffect( ()=>{

    (async ()=>{
      const post = await GetFeedPosts()
      console.log(post);

    })()
  },[])
  
  return (

    <div>
      <CreatePostForm />
      <PostList />
      </div>
  );
}
