"use client";

import { Tab } from "@/app/lib/types/groups";
import { useRouter, useSearchParams } from "next/navigation";

export default function Tabs() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "discover";

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
