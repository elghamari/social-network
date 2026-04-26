"use client";

import { useSearchParams } from "next/navigation";

import { useGroupList } from "../_hooks/use-groups-list";

import GroupCard from "./group-card";

import type { GroupTab } from "@/app/lib/types/group";

export default function GroupList() {
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as GroupTab) || "discover";
  const query = searchParams.get("query") || "";

  const { groups, loading } = useGroupList(activeTab, query);

  if (loading) {
    return <Skeleton />;
  }

  if (groups.length === 0) {
    return (
      <div className="groups-empty">
        <p className="groups-empty__title">No groups found</p>
        <p className="groups-empty__text">
          {activeTab === "joined"
            ? "You haven't joined any groups yet"
            : activeTab === "pending"
              ? "No pending requests"
              : "Try a different search"}
        </p>
      </div>
    );
  }

  return (
    <div className="groups-grid">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="groups-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="group-card group-card--skeleton">
          <div className="skeleton group-card__cover" />
          <div className="group-card__content">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--line-short" />
            <div className="group-card__footer">
              <div className="skeleton skeleton--badge" />
              <div className="skeleton skeleton--btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
