import { Dispatch, SetStateAction } from "react";
import { Tab } from "@/app/lib/types/groups";

import "./tabs.css";

export default function Tabs(
  activeTab: Tab,
  setActiveTab: Dispatch<SetStateAction<Tab>>,
) {
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
