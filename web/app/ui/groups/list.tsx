import { Group, Tab } from "@/app/lib/types/groups";
import GroupCard from "./card";

export default function GroupsList({
  groups,
  activeTab,
}: {
  groups: Group[];
  activeTab?: Tab;
}) {
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
        <GroupCard
          key={group.id}
          group={group}
          // onRequestJoin={handleRequestJoin}
        />
      ))}
    </div>
  );
}
