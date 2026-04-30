"use client";

import "./layout.css";

import { notFound, useParams } from "next/navigation";

import GroupProvider from "./_context/context";

import { useGroupDetail } from "./_hooks/use-group-detail";

import GroupSections from "./_components/group-sections";
import GroupHeader from "./_components/group-header";

import { LockIcon } from "@/app/ui/icons";

export default function GroupDetails({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;

  const { group, loading, toggleInvite } = useGroupDetail(id);

  if (loading) return <Skeleton />;

  if (!group || !group?.id) notFound();

  const isMember = group.role === "CREATOR" || group.role === "MEMBER";

  return (
    <div className="gd">
      <GroupHeader group={group} onRequest={toggleInvite} />

      {isMember ? (
        <>
          <GroupSections groupId={id} />
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

function Skeleton() {
  return (
    <div className="gd">
      <div
        className="skeleton gd__cover"
        style={{ borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}
      />

      <div className="gd__info">
        <div className="gd__info-text">
          <div
            className="skeleton"
            style={{ height: 26, width: "40%", marginBottom: 12 }}
          />
          <div
            className="skeleton"
            style={{ height: 14, width: "80%", marginBottom: 6 }}
          />
          <div
            className="skeleton"
            style={{ height: 14, width: "60%", marginBottom: 10 }}
          />
          <div className="skeleton" style={{ height: 13, width: 80 }} />
        </div>
        <div
          className="skeleton"
          style={{
            height: 42,
            width: 100,
            borderRadius: "var(--radius-md)",
            flexShrink: 0,
          }}
        />
      </div>

      <div className="gd__sections" style={{ marginTop: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 14, width: 70, margin: "12px 16px" }}
          />
        ))}
      </div>
    </div>
  );
}
