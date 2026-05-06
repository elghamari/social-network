"use client";
import { FormatTime } from "@/app/lib/utils/format-time";
import "./posts.css";
import { CommentType } from "@/app/lib/types/feed";
import Image from "next/image";

export default function CommentCard({ comment }: { comment: CommentType }) {
  return (
    <div className="comment-card">      
      <div className="comment-avatar">
        {
          comment.author.avatar ? (
            <Image className="post-card-avatar " width={100} height={100} src={comment.author.avatar ?? ''} alt={`${comment.author.nickname}'s avatar`}/>
          ) : (
            <div>{`${comment?.author?.fistname[0].toUpperCase() || '?'}${comment?.author?.lastname[0].toUpperCase() || '?'}`}</div>
          )
        }
      </div>

      <div className="comment-content-wrapper">
        <div className="comment-header">
          <span className="comment-author-name">
            {`${comment.author.fistname} ${comment.author.lastname}`}
          </span>
          <span className="comment-author-username">
            { comment.author.nickname ? `@${comment.author.nickname}` : '' }
          </span>
          <span className="dot-separator">•</span>
          <span className="comment-time">
            {FormatTime(comment.created_at)}
          </span>
        </div>

        <div className="comment-body">{comment.content}</div>

        {comment.image_url && (
          <div className="post-image-container">
            <img src={comment.image_url} alt="Post content" className="comment-image" />
          </div>
        )}

      </div>
    </div>
  );
}