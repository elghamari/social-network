"use client";

import type { PostType } from "@/app/lib/types/feed";
import { formatDate } from "@/app/lib/utils/format";
import { HeartIcon, CommentIcon } from "@/app/ui/icons";

type Props = {
  post: PostType;
};

export default function GroupPostCard({ post }: Props) {
  const { author } = post;

  const initials =
    author.fistname.charAt(0).toUpperCase() +
    author.lastname.charAt(0).toUpperCase();

  return (
    <div className="gp-post">
      <div className="gp-post__header">
        <div className="gp-post__avatar">
          {author.avatar ? <img src={author.avatar} alt="" /> : initials}
        </div>

        <div className="gp-post__meta">
          <div className="gp-post__author-row">
            <span className="gp-post__author">
              {author.fistname} {author.lastname}
            </span>
            <span className="gp-post__nickname">@{author.nickname}</span>
          </div>
          <span className="gp-post__date">{formatDate(post.created_at)}</span>
        </div>
      </div>

      <div className="gp-post__body">
        {post.title && <h3 className="gp-post__title">{post.title}</h3>}
        <p className="gp-post__content">{post.content}</p>

        {post.image_url && (
          <div className="gp-post__image">
            <img src={post.image_url} alt="" />
          </div>
        )}
      </div>

      <div className="gp-post__footer">
        <button
          type="button"
          className={`gp-post__action ${post.is_liked ? "gp-post__action--liked" : ""}`}
        >
          <HeartIcon size={16} filled={post.is_liked} />
          {post.total_likes}
        </button>
        <button type="button" className="gp-post__action">
          <CommentIcon size={16} />
          {post.total_comments}
        </button>
      </div>
    </div>
  );
}
