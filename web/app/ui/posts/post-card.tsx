"use client";
import "./posts.css";
import { PostType } from "@/app/lib/types/feed";

export default function PostCard({ post }: { post: PostType }) {
  return (
    <article className="post-card">
      <div className="post-card-header">
        <div className="post-card-avatar">{post.author.initials}</div>
        
        <div className="post-card-meta">
          <div className="post-author-info">
            <span className="post-author-name">{post.author.name}</span>
            <span className="post-author-username">{post.author.username}</span>
          </div>
          <div className="post-time-privacy">
            <span>{post.timeAgo}</span>
            <span className="dot-separator">•</span>
            <span>
              {post.privacy === "public" && "Public"}
              {post.privacy === "almost private" && "Almost Private"}
              {post.privacy === "private" && "Private"}
            </span>
          </div>
        </div>

      </div>

      <div className="post-card-body">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>
        
        {post.imageUrl && (
          <div className="post-image-container">
            <img src={post.imageUrl} alt="Post content" className="post-image" />
          </div>
        )}
      </div>

      <div className="post-card-footer">
        <button className="post-action-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span>{post.likesCount} Likes</span>
        </button>

        <button className="post-action-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{post.commentsCount} Comments</span>
        </button>
      </div>
    </article>
  );
}