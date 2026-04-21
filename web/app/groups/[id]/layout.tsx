import "./layout.css";
import { notFound } from "next/navigation";
import GroupTabs from "@/app/groups/[id]/_components/group-tabs";
import { getGroupById } from "@/app/lib/services/groups";
import { showToast } from "@/app/ui/layout/toast-store";
import { BASE_URL } from "@/app/lib/services/client";
import { LockIcon } from "@/app/ui/icons";

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

function actionLabel(role: string) {
  if (role === "CREATOR") return "Creator";
  if (role === "MEMBER") return "Joined";
  if (role === "PENDING") return "Pending";
  return "Request";
}

function actionClass(role: string) {
  if (role === "CREATOR" || role === "MEMBER") return "gd-action--member";
  if (role === "PENDING") return "gd-action--pending";
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
  const result = await getGroupById(id);

  if (!result.success) {
    showToast(result.error ?? "Something went wrong.");
    return;
  }

  const group = result.data;

  if (!group) notFound();

  const isMember = group.role === "creator" || group.status === "joined";
  const isCreator = group.role === "creator";

  return (
    <div className="gd">
      {/* Cover */}
      <div className={`gd__cover ${group.coverPath ? "" : "gd__cover--empty"}`}>
        {group.coverPath && (
          <img
            src={BASE_URL + group.coverPath}
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
          className={`gd-action ${actionClass(group.role)}`}
          disabled={isMember}
        >
          {actionLabel(group.role)}
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
            <LockIcon size={35} />
          </div>
          <h2 className="gd__restricted-title">Members only</h2>
          <p className="gd__restricted-text">
            {group.role === "PENDING"
              ? "Your request is pending. You'll get access once accepted."
              : "Request to join this group to see posts, events, and chat."}
          </p>
        </div>
      )}
    </div>
  );
}
