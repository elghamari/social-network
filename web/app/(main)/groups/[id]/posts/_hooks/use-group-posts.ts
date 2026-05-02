"use client";

import { useEffect, useState } from "react";
import type { PostType } from "@/app/lib/types/feed";
import { getGroupPosts } from "@/app/lib/services/group";

export type GroupPostsState = ReturnType<typeof useGroupPosts>;

export function useGroupPosts(groupId: string) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroupPosts(groupId)
      .then((resp) => setPosts(resp?.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  function addPost(post: PostType) {
    setPosts((prev) => [post, ...prev]);
  }

  return { posts, loading, addPost };
}
