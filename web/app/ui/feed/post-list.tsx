"use client";
import { PostListProps, PostType } from "@/app/lib/types/feed";
import PostCard from "./post-card";
import "./posts.css";
import { useEffect, useRef, useState } from "react";
import { showToast } from "../layout/toast-store";

export default function PostList({ refreshKey, fetchData }: PostListProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = async (
    currentCursor: number,
    isReset: boolean = false,
  ) => {
    if (isLoading || (!hasMore && !isReset)) return;
    setIsLoading(true);

    try {
      const response = await fetchData(currentCursor);
      if (response) {
        const newPosts: PostType[] = response.posts || response || [];
        setPosts((prev) => {
          if (isReset) return newPosts;
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });

        if (newPosts.length < 20) {
          setHasMore(false);
        } else {
          const lastPostId = newPosts[newPosts.length - 1].id;
          setCursor(lastPostId);
        }
      } else {
        if (isReset) setHasMore(false);
      }
    } catch (error) {
      showToast("Network error. Please check your connection.");
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setHasMore(true);
    setCursor(0);
    fetchPosts(0, true);
  }, [refreshKey]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchPosts(cursor, false);
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [cursor, hasMore, isLoading]);

  if (isLoading && posts.length === 0) {
    return <div className="loading-spinner">Loading feed...</div>;
  }

  return (
    <div className="post-list-container">
      {posts.length === 0 && !isLoading ? (
        <p className="no-posts-message">No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      {isLoading && (
        <div className="loading-spinner">Loading more posts...</div>
      )}

      <div ref={observerTarget} style={{ height: "20px", width: "100%" }}></div>

      {!hasMore && posts.length > 0 && (
        <p className="no-more-posts">You've reached the end!</p>
      )}
    </div>
  );
}
