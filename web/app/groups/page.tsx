"use client";

import "./page.css";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tab } from "@/app/lib/types/groups";
import { Group } from "@/app/lib/types/groups";

import GroupCard from "@/app/ui/groups/group-card";
import Tabs from "@/app/ui/groups/group-tabs";

import { PlusIcon } from "@/app/ui/icons";
import Search from "../ui/groups/group-search";

const mockGroups: Group[] = [
  {
    id: "1",
    title: "React Developers",
    description:
      "A community for React developers to share knowledge and best practices. ",
    createdAt: "2024-01-15",
    creatorId: "user1",
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
    memberCount: 890,
  },
  {
    id: "3",
    title: "Startup Founders",
    description: "Connect with other startup founders and share experiences.",
    createdAt: "2024-01-05",
    creatorId: "user3",
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
    memberCount: 3400,
  },
];

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

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <Search search={search} setSearch={setSearch} />


    </div>
  );
}
