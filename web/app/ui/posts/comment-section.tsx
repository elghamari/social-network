"use client";
import "./posts.css"; 

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    console.log('***************************************');
  return (
    <div className="comment-section-container">
      <div className="comment-input-wrapper">
        <input 
          type="text" 
          placeholder="Write a comment..." 
          className="comment-input"
        />
        <button className="btn-send-comment">Send</button>
      </div>
      
      <div className="comments-list">
        <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginTop: "10px" }}>
          Loading comments for this post 
        </p>
      </div>
    </div>
  );
}