import "./layout.css";
import { notFound } from "next/navigation";
import GroupTabs from "@/app/ui/groups/group-tabs";

type GroupStatus = "discover" | "pending" | "joined" | "creator";

const MOCK_GROUPS: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    memberCount: number;
    status: GroupStatus;
    cover?: string;
  }
> = {
  "1": {
    id: "1",
    title: "Design Collective",
    description:
      "A space for product designers, UI explorers, and creative builders to share ideas, feedback, and inspiration.",
    memberCount: 128,
    status: "creator",
    cover:
      "http://localhost:8080/uploads/65b664c5-5d9b-44cf-b1be-9b46a8241602.jpeg",
  },
  "2": {
    id: "2",
    title: "Frontend Lab",
    description:
      "For developers building polished interfaces with React, Next.js, animation, and clean component systems.",
    memberCount: 84,
    status: "pending",
  },
  "3": {
    id: "3",
    title: "Startup Circle",
    description:
      "Founders and early builders sharing launches, growth ideas, product feedback, and event meetups.",
    memberCount: 203,
    status: "discover",
  },
};

function actionLabel(status: GroupStatus) {
  if (status === "creator") return "Creator";
  if (status === "joined") return "Joined";
  if (status === "pending") return "Pending";
  return "Request to Join";
}

function actionClass(status: GroupStatus) {
  if (status === "creator" || status === "joined") return "gd-action--member";
  if (status === "pending") return "gd-action--pending";
  return "gd-action--request";
}

export default async function GroupLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const group = MOCK_GROUPS[id];

  if (!group) notFound();

  const isMember = group.status === "creator" || group.status === "joined";
  const isCreator = group.status === "creator";

  return (
    <div className="gd">
      {/* Cover */}
      <div className={`gd__cover ${group.cover ? "" : "gd__cover--empty"}`}>
        {group.cover && (
          <img
            src={group.cover}
            alt={`${group.title} cover`}
            className="gd__cover-img"
          />
        )}
      </div>

      {/* Header */}
      <div className="gd__header">
        <div className="gd__header-text">
          <h1 className="gd__title">{group.title}</h1>
          <p className="gd__description">{group.description}</p>
          <span className="gd__count">
            {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <button
          className={`gd-action ${actionClass(group.status)}`}
          disabled={isMember}
        >
          {actionLabel(group.status)}
        </button>
      </div>

      {isMember ? (
        <>
          <GroupTabs groupId={id} isMember={isMember} isCreator={isCreator} />
          <div className="gd__content">{children}</div>
        </>
      ) : (
        <div className="gd__restricted">
          <div className="gd__restricted-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10V7a5 5 0 0 1 10 0v3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h2 className="gd__restricted-title">Members only</h2>
          <p className="gd__restricted-text">
            {group.status === "pending"
              ? "Your request is pending. You'll get access once accepted."
              : "Request to join this group to see posts, events, and chat."}
          </p>
        </div>
      )}
    </div>
  );
}
