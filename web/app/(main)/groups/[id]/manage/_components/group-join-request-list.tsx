"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useGroupJoinRequestList } from "../_hooks/use-group-join-request-list";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "@/app/lib/services/group";
import { showToast } from "@/app/ui/layout/toast-store";

export default function GroupJoinRequestList({
  groupId,
}: {
  groupId: string;
}) {
  const router = useRouter();
  const { list, loading, removeJoinRequest } =
    useGroupJoinRequestList(groupId);
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (loading) return <ListSkeleton />;

  async function handleDecision(userId: string, approve: boolean) {
    setPendingId(userId);
    const action = approve ? approveJoinRequest : rejectJoinRequest;
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
        removeJoinRequest(userId);
    }
  }

  return (
    <section className="gd-manage__panel">
      <div className="gd-manage__panel-header">
        <h2 className="gd-manage__heading">Join Requests</h2>
        <p className="gd-manage__subtext">
          Accept or decline pending requests.
        </p>
      </div>

      {!list || list.length === 0 ? (
        <div className="gd-empty">No pending requests.</div>
      ) : (
        <div className="gd-manage__list">
          {list.map((req) => {
            const initials =
              req.firstName.charAt(0).toUpperCase() +
              req.lastName.charAt(0).toUpperCase();

            return (
              <div key={req.userId} className="gd-manage__row">
                <div className="gd-avatar">
                  {req.avatarPath ? (
                    <img src={req.avatarPath} alt="" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="gd-manage__user">
                  <span className="gd-manage__name">
                    {req.firstName} {req.lastName}
                  </span>
                </div>

                <div className="gd-manage__actions">
                  <button
                    type="button"
                    className="gd-manage__btn gd-manage__btn--accept"
                    disabled={pendingId === req.userId}
                    onClick={() => handleDecision(req.userId, true)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="gd-manage__btn gd-manage__btn--decline"
                    disabled={pendingId === req.userId}
                    onClick={() => handleDecision(req.userId, false)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
            <div className="skeleton" style={{ height: 14, width: "55%" }} />
            <div
              className="skeleton"
              style={{ height: 12, width: "30%", marginTop: 4 }}
            />
          </div>

          <div className="gd-manage__actions">
            <div
              className="skeleton"
              style={{
                height: 30,
                width: 65,
                borderRadius: "var(--radius-sm)",
              }}
            />
            <div
              className="skeleton"
              style={{
                height: 30,
                width: 65,
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
