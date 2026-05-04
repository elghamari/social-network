"use client";
import CreatePostForm from "@/app/ui/feed/create-form";
import PostList from "../ui/feed/post-list";
import { useState } from "react";
import { GetFeedPosts } from "../lib/services/feed";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <CreatePostForm onPostCreated={handlePostCreated}/>
      <PostList 
      refreshKey={refreshKey}
      fetchData={GetFeedPosts}
      />
    </div>
  );
}
