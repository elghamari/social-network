import { Group } from "@/app/lib/types/groups";
import JoinButton from "../../_components/join-button";

type HeaderProps = {
  group: Group;
  isMember: boolean;
};

export default function Header({ group, isMember }: HeaderProps) {
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
          <JoinButton
            groupId={group.id}
            groupRole={group.role}
            type="header"
          />
        )}
      </div>
    </div>
  );
}
