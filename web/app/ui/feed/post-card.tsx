"use client";
import { FormatTime } from "@/app/lib/utils/format-time";
import "./posts.css";
import { PostType } from "@/app/lib/types/feed";
import { useState } from "react";
import { ToggleLikePost } from "@/app/lib/services/feed";
import { showToast } from "../layout/toast-store";
import CommentSection from "./comment-section";
import Image from "next/image";
import Link from "next/link";
import { CommentIcon, HeartIcon } from "../icons";

export default function PostCard({ post }: { post: PostType }) {

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.total_likes);
  
  const [isLiking, setIsLiking] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [commentsCount, setCommentsCount] = useState(post.total_comments);
  const handleCommentCreated = () => {
    setCommentsCount(prev => prev + 1);
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await ToggleLikePost(post.id);
      
      if (response) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error: any) {
      console.log("Error :", error);
      showToast("Network error. Please check your connection.");
    } finally {
      setIsLiking(false);
    }
  };

  
  return (
    <article className="post-card">
      <div className="post-card-header">
          <Link href={`/profile/${post.author.id}`}>
          {
            post.author.avatar ? (
              <Image className="post-card-avatar post-card-image" width={100} height={100} src={post.author.avatar ?? ''} alt={`${post.author.nickname}'s avatar`}/>
            ) : (
              <div className="post-card-avatar">{`${post?.author?.fistname[0].toUpperCase() || '?'}${post?.author?.lastname[0].toUpperCase() || '?'}`}</div>
            )
          }
          </Link>
        
        <div className="post-card-meta">
          <div className="post-author-info">
            <Link href={`/profile/${post.author.id}`}>
            <span className="post-author-name">{`${post.author.fistname} ${post.author.lastname}`}</span>
            </Link>
            <span className="post-author-username">{ post.author.nickname ? `@${post.author.nickname}` : '' }</span>
          </div>
          <div className="post-time-privacy">
            <span>{FormatTime(post.created_at)}</span>
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
        
        {post.image_url && (
          <div className="post-image-container">
            <img src={post.image_url} alt="Post content" className="post-image" />
          </div>
        )}
      </div>

      <div className="post-card-footer">
        <button 
          className={`post-action-btn ${isLiked ? 'like-active' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <HeartIcon size={24} filled={isLiked} />
          <span>{likesCount} Likes</span>
        </button>

        <button 
        className="post-action-btn"
        onClick={() => setShowComments(!showComments)} 
        >
          <CommentIcon size={20} />
          <span>{commentsCount} Comments</span>
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} onCommentCreated={handleCommentCreated}/>
      )}

    </article>
  );
}