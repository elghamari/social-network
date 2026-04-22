import Link from "next/link";
import { PlusIcon } from "@/app/ui/icons";

const MOCK_POSTS = [
  {
    id: "p1",
    author: "Ava Morgan",
    initials: "AM",
    content:
      "Just finished a full redesign of our onboarding flow — went from 9 steps to 4. Drop rate improved by 40%.",
    createdAt: "2h ago",
    commentCount: 8,
  },
  {
    id: "p2",
    author: "Noah Lee",
    initials: "NL",
    content:
      "Has anyone experimented with variable fonts for UI? I've been using them for responsive type scaling and the results are really clean.",
    createdAt: "5h ago",
    commentCount: 4,
  },
  {
    id: "p3",
    author: "You",
    initials: "YO",
    content:
      "Reminder: critique session is this Thursday at 7 PM. Drop your screens below so I can queue them up.",
    createdAt: "1d ago",
    commentCount: 12,
  },
];

export default function GroupPosts({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  return (
    <div className="gp-section">
      <div className="gp-section__header">
        <h2 className="gp-section__title">Posts</h2>

        {isMember && (
          <Link href={`/groups/${groupId}/posts/create`} className="gp-btn">
            <PlusIcon />
            New Post
          </Link>
        )}
      </div>

      <div className="gp-section__body">
        {!isMember ? (
          <div className="gp-locked">
            <p className="gp-locked__title">Members only</p>
            <p className="gp-locked__text">
              Join this group to see and create posts.
            </p>
          </div>
        ) : MOCK_POSTS.length === 0 ? (
          <div className="gp-empty">No posts yet. Be the first to post.</div>
        ) : (
          <div className="gp-posts">
            {MOCK_POSTS.map((post) => (
              <div key={post.id} className="gp-post">
                <div className="gp-post__top">
                  <div className="gp-avatar">{post.initials}</div>
                  <div className="gp-post__meta">
                    <span className="gp-post__author">{post.author}</span>
                    <span className="gp-post__time">{post.createdAt}</span>
                  </div>
                </div>
                <p className="gp-post__content">{post.content}</p>
                <div className="gp-post__footer">
                  <button className="gp-post__comment-btn">
                    💬 {post.commentCount}{" "}
                    {post.commentCount === 1 ? "comment" : "comments"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
