import { Group } from "@/app/lib/types/groups";

export default function GroupList({groups, handleRequest}:{groups: Group[], handleRequestJoin:(groupId: string) => void}) {



return (
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
    )})
  }