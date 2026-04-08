"use client";

import { useState, useMemo } from "react";

import Link from "next/link";
import { PlusIcon } from "@/app/ui/icons";

import { Group } from "@/app/lib/types/groups";
import GroupCard from "@/app/ui/groups/card";
import "./page.css";

const mockGroups: Group[] = [
  {
    id: "1",
    title: "React Developers",
    description:
      "A community for React developers to share knowledge and best practices. ",
    createdAt: "2024-01-15",
    creatorId: "user1",
    creator: { id: "user1", firstName: "John", lastName: "Doe" },
    memberCount: 1250,
    isJoined: true,
    role: "member",
  },
  {
    id: "2",
    title: "Photography Enthusiasts",
    description:
      "Share your photography and get feedback from fellow photographers.",
    coverImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
    createdAt: "2024-02-20",
    creatorId: "user2",
    creator: { id: "user2", firstName: "Jane", lastName: "Smith" },
    memberCount: 890,
  },
  {
    id: "3",
    title: "Startup Founders",
    description: "Connect with other startup founders and share experiences.",
    createdAt: "2024-01-05",
    creatorId: "user3",
    creator: { id: "user3", firstName: "Mike", lastName: "Johnson" },
    memberCount: 456,
    isPending: true,
  },
  {
    id: "4",
    title: "Fitness & Wellness",
    description: "Your journey to a healthier lifestyle starts here.",
    coverImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    createdAt: "2024-03-01",
    creatorId: "user4",
    creator: { id: "user4", firstName: "Sarah", lastName: "Wilson" },
    memberCount: 2100,
    isJoined: true,
    role: "creator",
  },
  {
    id: "5",
    title: "Gaming League",
    description:
      "Competitive and casual gamers unite! Join tournaments and find teammates.",
    coverImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    createdAt: "2024-02-10",
    creatorId: "user5",
    creator: { id: "user5", firstName: "Alex", lastName: "Brown" },
    memberCount: 3400,
  },
];

type Tab = "discover" | "joined" | "pending";

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>(mockGroups);

  const handleRequestJoin = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isPending: true } : g)),
    );
  };

  const filteredGroups = useMemo(() => {
    let result = groups;

    if (activeTab === "joined") result = result.filter((g) => g.isJoined);
    else if (activeTab === "pending")
      result = result.filter((g) => g.isPending);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [groups, activeTab, search]);

  const counts = {
    joined: groups.filter((g) => g.isJoined).length,
    pending: groups.filter((g) => g.isPending).length,
  };

  return (
    <div className="groups-page">
      <div className="groups-page__header">
        <h1 className="groups-page__title">Groups</h1>
        <Link href="/groups/create" className="btn-primary">
          <PlusIcon />
          Create
        </Link>
      </div>

      <div className="groups-tabs">
        <button
          className={`groups-tabs__tab ${activeTab === "discover" ? "groups-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          Discover
        </button>
        <button
          className={`groups-tabs__tab ${activeTab === "joined" ? "groups-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("joined")}
        >
          Joined ({counts.joined})
        </button>
        <button
          className={`groups-tabs__tab ${activeTab === "pending" ? "groups-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({counts.pending})
        </button>
      </div>

      <div className="groups-search">
        <span className="groups-search__icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="groups-search__input"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredGroups.length > 0 ? (
        <div className="groups-grid">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onRequestJoin={handleRequestJoin}
            />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
