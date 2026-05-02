"use client";

import "./page.css";

import { useState } from "react";

import { useGroupContext } from "../_context/context";
import { useGroupPosts } from "./_hooks/use-group-posts";

import GroupPostCard from "./_components/group-post-card";
import GroupPostFormModal from "./_components/group-post-form-modal";

import type { PostType } from "@/app/lib/types/feed";

export default function GroupPostsPage() {
  const { id } = useGroupContext();
  const { posts, loading, addPost } = useGroupPosts(id);
  const [showModal, setShowModal] = useState(false);

  if (loading) return <Skeleton />;

  function handleCreated(post: PostType) {
    addPost(post);
    setShowModal(false);
  }

  return (
    <div className="gd-card">
      <div className="gd-card__header">
        <h2 className="gd-card__title">Posts</h2>
        <button
          type="button"
          className="gd-btn"
          onClick={() => setShowModal(true)}
        >
          + Create Post
        </button>
      </div>

      <div className="gd-card__body">
        {posts.length === 0 ? (
          <div className="gd-empty">No posts yet.</div>
        ) : (
          <div className="gd-posts">
            {posts.map((post) => (
              <GroupPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <GroupPostFormModal
          groupId={id}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="gd-card">
      <div className="gd-card__header">
        <div className="skeleton" style={{ height: 16, width: 60 }} />
        <div
          className="skeleton"
          style={{
            height: 34,
            width: 120,
            borderRadius: "var(--radius-md)",
          }}
        />
      </div>

      <div className="gd-card__body">
        <div className="gd-posts">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="gp-post">
      <div className="gp-post__header">
        <div className="skeleton gp-post__avatar" />
        <div className="gp-post__meta">
          <div className="skeleton" style={{ height: 14, width: "40%" }} />
          <div
            className="skeleton"
            style={{ height: 12, width: "25%", marginTop: 4 }}
          />
        </div>
      </div>

      <div className="gp-post__body">
        <div className="skeleton" style={{ height: 16, width: "60%" }} />
        <div
          className="skeleton"
          style={{ height: 13, width: "90%", marginTop: 8 }}
        />
        <div
          className="skeleton"
          style={{ height: 13, width: "75%", marginTop: 4 }}
        />
      </div>

      <div className="gp-post__footer">
        <div
          className="skeleton"
          style={{ height: 28, width: 60, borderRadius: "var(--radius-sm)" }}
        />
        <div
          className="skeleton"
          style={{ height: 28, width: 80, borderRadius: "var(--radius-sm)" }}
        />
      </div>
    </div>
  );
}
