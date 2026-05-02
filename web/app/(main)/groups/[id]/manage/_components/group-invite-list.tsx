"use client";

import GroupUserRow from "./group-user-row";

import { InviteListState } from "../_hooks/use-invite-list";

type Props = {
  invites: InviteListState;
};

export default function GroupInviteList({ invites }: Props) {
  return (
    <section className="gd-manage__panel">
      <div className="gd-manage__panel-header">
        <h2 className="gd-manage__heading">Invite Users</h2>
        <p className="gd-manage__subtext">Send group invitations to users.</p>
      </div>

      <input
        className="gd-manage__search"
        type="text"
        placeholder="Search by name..."
        value={invites.query}
        onChange={(e) => invites.setQuery(e.target.value)}
      />

      <div className="gd-manage__list">
        {invites.loading ? (
          <Skeleton />
        ) : invites.list.length === 0 ? (
          <div className="gd-manage__empty">
            {invites.query.trim()
              ? "No users match your search."
              : "No users to invite."}
          </div>
        ) : (
          invites.list.map((user) => (
            <GroupUserRow key={user.id} user={user}>
              <button
                className={`gd-manage__btn ${
                  user.isInvited
                    ? "gd-manage__btn--invited"
                    : "gd-manage__btn--invite"
                }`}
                onClick={() => invites.toggleInvite(user.id, user.isInvited)}
                disabled={invites.pendingId === user.id}
              >
                {invites.pendingId === user.id
                  ? "..."
                  : user.isInvited
                    ? "Invited"
                    : "Invite"}
              </button>
            </GroupUserRow>
          ))
        )}
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="gd-manage__row">
          <div className="skeleton gd-avatar" />
          <div className="gd-manage__user">
            <div className="skeleton" style={{ height: 13, width: "50%" }} />
          </div>
          <div
            className="skeleton"
            style={{ height: 30, width: 70, borderRadius: "var(--radius-sm)" }}
          />
        </div>
      ))}
    </>
  );
}
