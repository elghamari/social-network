"use client";
import { PostType } from "@/app/lib/types/feed";
import PostCard from "./post-card";
import "./posts.css";
import { useEffect, useState } from "react";
import { GetFeedPosts } from "@/app/lib/services/feed";

export default function PostList({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<PostType[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await GetFeedPosts();
        if (response && response.posts) {
          setPosts(response.posts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [refreshKey]);

  if (isLoading) {
    return <div className="loading-spinner">Loading posts...</div>;
  }

  return (
    <div className="post-list-container">
      {posts.length === 0 ? (
        <p className="no-posts-message">No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
