"use client";

import { useSearchParams } from "next/navigation";

import { useGroups } from "../_hooks/useGroups";

import GroupListSkeleton from "./groups-list-skeleton";
import GroupCard from "./group-card";

import { Tab } from "@/app/lib/types/groups";

export default function GroupsList() {
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as Tab) || "discover";
  const query = searchParams.get("query") || "";

  const { groups, loading } = useGroups(activeTab, query);

  if (loading) {
    return <GroupListSkeleton />;
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
