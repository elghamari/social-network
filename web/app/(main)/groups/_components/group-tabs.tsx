"use client";

import type { GroupTab } from "@/app/lib/types/group";
import { useRouter, useSearchParams } from "next/navigation";

export default function GroupTabs() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as GroupTab) || "discover";

  function setActiveTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/groups?${params.toString()}`);
  }

  return (
    <div className="groups-tabs">
      {["discover", "joined", "pending"].map((tab) => (
        <button
          key={tab}
          className={`groups-tabs__tab ${activeTab === tab ? "groups-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
