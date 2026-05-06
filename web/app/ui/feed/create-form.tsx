"use client";
import { useState } from "react";
import PostForm from "./post-form";
import "./posts.css";
import {  CreatePostFormProps, PostFormProps } from "@/app/lib/types/feed";
import { useAuth } from "@/app/_context/AuthContext";

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => setShowForm(false);

  const user = useAuth();

  return (
    <div className="show-create-card">
      <div className="create-post-header">
        <div className="post-avatar">{`${user?.user?.first_name[0].toUpperCase() || '?'}${user?.user?.last_name[0].toUpperCase() || '?'}`}</div>
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
            inGroup={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}