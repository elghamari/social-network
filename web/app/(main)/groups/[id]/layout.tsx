"use client";

import "./layout.css";
import { notFound, useParams } from "next/navigation";

import GroupSections from "./_components/group-sections";
import { LockIcon } from "@/app/ui/icons";
import { useGroupDetail } from "./_hooks/use-group-detail";
import GroupHeader from "./_components/group-header";
import GroupLayoutSkeleton from "./_components/group-layout-skeleton";
import GroupProvider from "./_context/group-context";

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;

  const { group, loading } = useGroupDetail(id);

  if (loading) return <GroupLayoutSkeleton />;
  if (!group) notFound();

  const isMember = group.role === "CREATOR" || group.role === "MEMBER";
  const isCreator = group.role === "CREATOR";

  return (
    <div className="gd">
      <GroupHeader group={group} isMember={isMember} />

      {isMember ? (
        <>
          <GroupSections
            groupId={id}
            isMember={isMember}
            isCreator={isCreator}
          />
          <div className="gd__content">
            <GroupProvider group={group}>{children}</GroupProvider>
          </div>
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
