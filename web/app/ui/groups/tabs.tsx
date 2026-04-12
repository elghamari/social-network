import { Dispatch, SetStateAction } from "react";
import { GroupTab } from "@/app/lib/types/groups";

export default function GroupTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: GroupTab;
  setActiveTab: Dispatch<SetStateAction<GroupTab>>;
}) {
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
