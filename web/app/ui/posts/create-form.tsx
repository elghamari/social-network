"use client";
import { useState } from "react";
import PostForm from "./post-form";
import "./posts.css";

export default function CreatePostForm() {
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => setShowForm(false);

  return (
    <div className="show-create-card">
      <div className="create-post-header">
        <div className="post-avatar">JD</div>
        <div 
          className="create-post-input" 
          onClick={() => setShowForm(true)} 
        >
          What's on your mind?
        </div>
      </div>

      {showForm && (
        <div 
          className="modal-overlay" 
          onClick={handleClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PostForm onCancel={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
}