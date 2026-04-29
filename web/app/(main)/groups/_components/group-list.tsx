"use client";

import GroupCard from "./group-card";

import type { Group } from "@/app/lib/types/group";

type Props = {
  groups: Group[];
  loading: boolean;
  onRequest: (gid: string) => void;
};

export default function GroupList({ groups, loading, onRequest }: Props) {
  if (loading) {
    return <Skeleton />;
  }

  if (groups.length === 0) {
    return (
      <div className="groups-empty">
        <p className="groups-empty__title">No groups found</p>
      </div>
    );
  }

  return (
    <div className="groups-grid">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} onRequest={onRequest} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="groups-grid">
      {Array.from({ length: 6 }).map((_, i) => (
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
    </div>
  );
}
