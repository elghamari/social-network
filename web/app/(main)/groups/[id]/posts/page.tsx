import "../layout.css";

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
      "Has anyone experimented with variable fonts for UI? I've been using them for responsive type scaling and results are really clean.",
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

// TODO: replace with real membership check
const IS_MEMBER = true;

export default function PostsPage() {
  if (!IS_MEMBER) {
    return (
      <div className="gd-locked">
        <p className="gd-locked__title">Members only</p>
        <p className="gd-locked__text">
          Join this group to see and create posts.
        </p>
      </div>
    );
  }

  if (MOCK_POSTS.length === 0) {
    return <div className="gd-empty">No posts yet. Be the first to post.</div>;
  }

  return (
    <div className="gd-posts">
      {MOCK_POSTS.map((post) => (
        <div key={post.id} className="gd-post">
          <div className="gd-post__top">
            <div className="gd-avatar">{post.initials}</div>
            <div className="gd-post__meta">
              <span className="gd-post__author">{post.author}</span>
              <span className="gd-post__time">{post.createdAt}</span>
            </div>
          </div>

          <p className="gd-post__content">{post.content}</p>

          <div className="gd-post__footer">
            <button className="gd-post__comment-btn">
              💬 {post.commentCount}{" "}
              {post.commentCount === 1 ? "comment" : "comments"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
