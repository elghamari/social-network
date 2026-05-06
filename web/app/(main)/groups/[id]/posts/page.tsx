"use client";

import { useState } from "react";
import { useGroupContext } from "../_context/context";
import "@/app/ui/feed/posts.css";
import PostForm from "@/app/ui/feed/post-form";
import PostList from "@/app/ui/feed/post-list";
import { GetGroupPosts } from "@/app/lib/services/feed";

export default function GroupPostsPage() {
  const { id } = useGroupContext();
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
        <PostList 
          refreshKey={refreshKey}
          fetchData={async (cursor) => await GetGroupPosts(cursor, id)}
        />
      </div>

      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={handleClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PostForm 
            onCancel={handleClose} 
            onPostCreated={handlePostCreated}
            inGroup={true}
            groupId={id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
