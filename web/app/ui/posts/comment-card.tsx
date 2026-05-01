"use client";
import { FormatTime } from "@/app/lib/utils/format-time";
import "./posts.css";
import { CommentType } from "@/app/lib/types/feed";

export default function CommentCard({ comment }: { comment: CommentType }) {
  return (
    <div className="comment-card">      
      <div className="comment-avatar">
        {comment.author.avatar
          ? comment.author.avatar
          : comment.author.fistname?.[0]?.toUpperCase() || "?"}
      </div>

      <div className="comment-content-wrapper">
        <div className="comment-header">
          <span className="comment-author-name">
            {`${comment.author.fistname} ${comment.author.lastname}`}
          </span>
          <span className="comment-author-username">
            @{comment.author.nickname}
          </span>
          <span className="dot-separator">•</span>
          <span className="comment-time">
            {FormatTime(comment.created_at)}
          </span>
        </div>

        <div className="comment-body">{comment.content}</div>
      </div>
    </div>
  );
}