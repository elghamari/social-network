import Link from "next/link";
import { Group } from "@/app/types";
import "./groups.css";

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link href={`/groups/${group.id}`} className="group-card">
      <div className="group-card__banner">
        <div className="group-card__icon">{group.title[0].toUpperCase()}</div>
      </div>

      <div className="group-card__content">
        <h3 className="group-card__title">{group.title}</h3>
        <p className="group-card__description">{group.description}</p>

        <div className="group-card__meta">
          <span className="group-card__members">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{group.memberCount} members</span>
          </span>
          <span className="group-card__date">
            Created {formatDate(group.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
