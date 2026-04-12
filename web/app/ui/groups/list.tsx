import { Group } from "@/app/lib/types/groups";

export default function GroupsList({
  groups,
  tab,
}: {
  groups: Group[];
  tab?: string;
}) {
  console.log(groups);

  if (groups.length) {
    return (
      <div className="groups-empty">
        <p className="groups-empty__title">No groups found</p>
        <p className="groups-empty__text">
          {tab === "joined"
            ? "You haven't joined any groups yet"
            : tab === "pending"
              ? "No pending requests"
              : "Try a different search"}
        </p>
      </div>
    );
  }

  // return (
  //   {filteredGroups.length > 0 ? (
  //     <div className="groups-grid">
  //     {filteredGroups.map((group) => (
  //       <GroupCard
  //       key={group.id}
  //       group={group}
  //       onRequestJoin={handleRequestJoin}
  //       />
  //     ))}
  //     </div>
  //   ) : })
}
