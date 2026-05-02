import { cancelJoinRequest, submitJoinRequest } from "@/app/lib/services/group";
import type { Group } from "@/app/lib/types/group";
import { useState } from "react";

type Props = {
  group: Group;
  onRequest: (pending: boolean) => void;
};

export default function GroupHeader({ group, onRequest }: Props) {
  const isMember = group.role === "CREATOR" || group.role === "MEMBER";
  const isPending = group.role === "PENDING";

  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.MouseEvent) => {
    const action = isPending ? cancelJoinRequest : submitJoinRequest;

    setLoading(true);
    const resp = await action(group.id);
    setLoading(false);

    if (!resp) return;

    onRequest(!isPending);
  };

  return (
    <div className="gd__header">
      <div className={`gd__cover ${group.coverPath ? "" : "gd__cover--empty"}`}>
        {group.coverPath && (
          <img
            src={group.coverPath}
            alt={`${group.title} cover`}
            className="gd__cover-img"
          />
        )}
      </div>

      <div className="gd__info">
        <div className="gd__info-text">
          <h1 className="gd__title">{group.title}</h1>
          <p className="gd__description">{group.description}</p>
          <span className="gd__count">
            {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        {isMember ? (
          <span className="gd__badge gd__badge--member">
            {group.role === "CREATOR" ? "Creator" : "Joined"}
          </span>
        ) : (
          <button
            className={
              isPending
                ? "gd__badge gd__badge--pending"
                : "gd__badge gd__badge--request"
            }
            onClick={handleRequest}
            disabled={loading}
          >
            {loading ? "..." : isPending ? "Pending" : "Request"}
          </button>
        )}
      </div>
    </div>
  );
}
