"use client";

import "./layout.css";
import { notFound, useParams } from "next/navigation";

import Sections from "./_components/sections";
import { LockIcon } from "@/app/ui/icons";
import { useGroup } from "./_hooks/useGroup";
import Header from "./_components/header";
import LayoutSkeleton from "./_components/layout-skeleton";

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;

  const { group, loading } = useGroup(id);

  if (loading) return <LayoutSkeleton />;
  if (!group) notFound();

  const isMember = group.role === "CREATOR" || group.role === "MEMBER";
  const isCreator = group.role === "CREATOR";

  return (
    <div className="gd">
      <Header group={group} isMember={isMember} />

      {isMember ? (
        <>
          <Sections groupId={id} isMember={isMember} isCreator={isCreator} />
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
