type GroupStatus = "discover" | "pending" | "joined" | "creator";

function actionLabel(status: GroupStatus) {
  if (status === "creator") return "Creator";
  if (status === "joined") return "Joined";
  if (status === "pending") return "Pending";
  return "Request to Join";
}

function actionClass(status: GroupStatus) {
  if (status === "creator" || status === "joined") return "gp-action--member";
  if (status === "pending") return "gp-action--pending";
  return "gp-action--request";
}

export default function GroupHeader({
  group,
}: {
  group: {
    id: string;
    title: string;
    description: string;
    memberCount: number;
    status: GroupStatus;
  };
}) {
  const isMember = group.status === "creator" || group.status === "joined";

  return (
    <div className="gp-header">
      <div className="gp-header__cover" />

      <div className="gp-header__info">
        <div className="gp-header__text">
          <h1 className="gp-header__title">{group.title}</h1>
          <p className="gp-header__description">{group.description}</p>
          <span className="gp-header__count">
            {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <button
          className={`gp-action ${actionClass(group.status)}`}
          disabled={isMember}
        >
          {actionLabel(group.status)}
        </button>
      </div>
    </div>
  );
}
