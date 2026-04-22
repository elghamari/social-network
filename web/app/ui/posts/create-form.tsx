"use client";
import { useState } from "react";
import "./posts.css";

export default function CreatePostForm() {
  const [showForm, setShowForm] = useState(false);

  return (
      <div className="show-create-card" id="show-create-card">
        <div className="create-post-header">
          <div className="post-avatar">JD</div>
          <div className="create-post-input" id="promptTrigger" 
          onClick={() => {
            setShowForm(!showForm);
          }} >
            What's on your mind?
          </div>
        </div>

        <div
          id="promptTrigger"> { showForm && <PostForm /> }
        </div>
      </div>
  );
}

function PostForm() {
  return (
      <div id="createForm">
        <input 
          type="text" className="create-post-title"
          id="post-title"
          placeholder="title here ..."
          ></input>
        <textarea
          className="create-post-area"
          id="post-description"
          placeholder="Share something with your network…"
        ></textarea>
        
        <div className="create-post-actions">
          <button className="btn btn-post-cancel" id="cancelBtn">
            Cancel
          </button>
          <button className="btn btn-primary" id="submitBtn">
            Post
          </button>
        </div>
      </div>
  );
}
