"use client";

import GroupCard from "./group-card";
import type { Group, GroupTab } from "@/app/lib/types/group";

type Props = {
  tab: GroupTab;
  groups: Group[];
  loading: boolean;
  markerRef: React.RefObject<HTMLDivElement | null>;
  onRoleChange: (groupId: string) => void;
};

const SKELETON_COUNT = 6;

const emptyStates: Record<GroupTab, { title: string; subtitle: string }> = {
  discover: {
    title: "No groups to discover",
    subtitle: "Check back later for new groups to join.",
  },
  joined: {
    title: "You haven't joined any groups yet",
    subtitle: "Discover groups and start connecting.",
  },
  invitations: {
    title: "No pending invitations",
    subtitle: "When someone invites you to a group, it will appear here.",
  },
  requests: {
    title: "No pending requests",
    subtitle: "Groups you request to join will appear here.",
  },
};

export default function GroupList({
  tab,
  groups,
  loading,
  markerRef,
  onRoleChange,
}: Props) {
  if (!loading && groups.length === 0) {
    const empty = emptyStates[tab];
    return (
      <div className="groups-empty">
        <p className="groups-empty__title">{empty.title}</p>
        <p className="groups-empty__subtitle">{empty.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="groups-grid">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onRoleChange={() => onRoleChange(group.id)}
        />
      ))}

      {loading && <SkeletonRows />}

      <div ref={markerRef} aria-hidden="true" />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className="group-card group-card--skeleton">
          <div className="skeleton group-card__cover" />
          <div className="group-card__content">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--line-short" />
            <div className="group-card__footer">
              <div className="skeleton skeleton--badge" />
              <div className="skeleton skeleton--btn" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
