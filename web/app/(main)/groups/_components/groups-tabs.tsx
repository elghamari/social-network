"use client";

import { redirect } from "next/navigation";

export default function GroupsTabs({ activeTab }: { activeTab: string }) {
  function setActiveTab(tab: string) {
    redirect(`/groups?tab=${tab}`);
  }

  return (
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
        Joined
      </button>
      <button
        className={`groups-tabs__tab ${activeTab === "pending" ? "groups-tabs__tab--active" : ""}`}
        onClick={() => setActiveTab("pending")}
      >
        Pending
      </button>
    </div>
  );
}
