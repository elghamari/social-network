"use client";
import { useState } from "react";
import PostForm from "./post-form";
import "./posts.css";
import {  CreatePostFormProps, PostFormProps } from "@/app/lib/types/feed";

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
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
            <PostForm 
            onCancel={handleClose} 
            onPostCreated={onPostCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}