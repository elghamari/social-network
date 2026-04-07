"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GroupCard from "@/app/ui/groups/groups-card";
import { Group } from "@/app/types";
import "@/app/ui/groups/groups.css";

// Fake data for testing
const fakeGroups: Group[] = [
  {
    id: "1",
    creatorId: "1",
    title: "Web Developers",
    description:
      "A community for web developers to share knowledge and collaborate on projects.",
    memberCount: 128,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    creatorId: "2",
    title: "Photography Enthusiasts",
    description: "Share your photos, get feedback, and learn new techniques.",
    memberCount: 56,
    createdAt: "2024-02-20T14:30:00Z",
  },
  {
    id: "3",
    creatorId: "1",
    title: "Music Producers",
    description: "Connect with fellow producers, share beats, and collaborate.",
    memberCount: 89,
    createdAt: "2024-03-10T09:15:00Z",
  },
];

type TabType = "discover" | "my-groups";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGroups(fakeGroups);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="groups-page">
      {/* Header */}
      <div className="groups-page__header">
        <div className="groups-page__title">
          <h1>Groups</h1>
          <p>Discover communities and connect with like-minded people</p>
        </div>
        <Link href="/groups/create" className="btn btn--primary">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Create Group</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="groups-page__tabs">
        <button
          className={`tab ${activeTab === "discover" ? "tab--active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          Discover
        </button>
        <button
          className={`tab ${activeTab === "my-groups" ? "tab--active" : ""}`}
          onClick={() => setActiveTab("my-groups")}
        >
          My Groups
        </button>
      </div>

      {/* Content */}
      <div className="groups-page__content">
        {isLoading ? (
          <div className="groups-page__loading">
            <div className="spinner"></div>
            <p>Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="groups-page__empty">
            <div className="empty-icon">👥</div>
            <h3>No groups found</h3>
            <p>Be the first to create a group!</p>
            <Link href="/groups/create" className="btn btn--primary">
              Create Group
            </Link>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
