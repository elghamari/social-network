"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useGroupInviteList } from "../_hooks/use-group-invite-list";

import {
  createGroupInvitation,
  revokeGroupInvitation,
} from "@/app/lib/services/group";
import { showToast } from "@/app/ui/layout/toast-store";

export default function GroupInviteList({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { list, loading, search, setInvite } = useGroupInviteList(groupId);

  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleInvite(userId: string) {
    const user = list?.find((u) => u.id === userId);
    if (!user) return;

    const action = user.isInvited
      ? revokeGroupInvitation
      : createGroupInvitation;

    setPendingId(userId);
    const resp = await action(groupId, userId);
    setPendingId(null);

    switch (resp.status) {
      case 401:
        router.push("/login");
        break;

      case 400:
        showToast(resp.error ?? "Something went wrong");
        break;

      case 500:
        showToast("Something went wrong");
        break;

      default:
        setInvite(userId, !user.isInvited);
    }
  }

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
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
      />

      <div className="gd-manage__list">
        {loading ? (
          <ListSkeleton />
        ) : !list || list.length === 0 ? (
          <div className="gd-manage__empty">
            {!list ? "No users match your search." : "No users to invite."}
          </div>
        ) : (
          list.map((user) => {
            const initials =
              user.firstName.charAt(0).toUpperCase() +
              user.lastName.charAt(0).toUpperCase();

            return (
              <div key={user.id} className="gd-manage__row">
                <div className="gd-avatar">
                  {user.avatarPath ? (
                    <img src={user.avatarPath} alt="" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="gd-manage__user">
                  <span className="gd-manage__name">
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                <button
                  className={`gd-manage__btn ${
                    user.isInvited
                      ? "gd-manage__btn--invited"
                      : "gd-manage__btn--invite"
                  }`}
                  onClick={() => handleInvite(user.id)}
                  disabled={pendingId === user.id}
                >
                  {pendingId === user.id
                    ? "..."
                    : user.isInvited
                      ? "Invited"
                      : "Invite"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function ListSkeleton() {
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
